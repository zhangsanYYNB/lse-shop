// LiteLoader-AIDS automatic generated
/// <reference path="d:\ll/dts/helperlib/src/index.d.ts"/> 

ll.registerPlugin(
    /* name */ "商店系统",
    /* introduction */ "一个简单的商店系统",
    /* version */ [1,0,4],
    /* otherInformation */ {}
); 

// 读取商店配置
/**
 * @type {Object}
 */
const shopConfig = JSON.parse(File.readFrom("plugins/shop/shopdata.json"));
const nameItem = new KVDatabase("plugins/shop/db")
const config = new JsonConfigFile("plugins/shop/config.json", "{\"AutoSell\": true,\"AutoSellTime\": 60}");

// 基岩版旧式数字附魔 ID 到简体中文名称的映射。
// 主要用于解析物品 NBT 中形如 { id: 9, lvl: 5 } 的附魔记录。
var ITEM_ENCHANTMENT_NAMES = {
	0: "保护", 1: "火焰保护", 2: "摔落保护", 3: "爆炸保护", 4: "弹射物保护",
	5: "荆棘", 6: "水下呼吸", 7: "深海探索者", 8: "水下速掘", 9: "锋利",
	10: "亡灵杀手", 11: "节肢杀手", 12: "击退", 13: "火焰附加", 14: "抢夺",
	15: "效率", 16: "精准采集", 17: "耐久", 18: "时运", 19: "力量",
	20: "冲击", 21: "火矢", 22: "无限", 23: "海之眷顾", 24: "饵钓",
	25: "冰霜行者", 26: "经验修补", 27: "绑定诅咒", 28: "消失诅咒", 29: "穿刺",
	30: "激流", 31: "忠诚", 32: "引雷", 33: "多重射击", 34: "穿透",
	35: "快速装填", 36: "灵魂疾行", 37: "迅捷潜行", 38: "风爆", 39: "蓄势猛击",
	40: "突刺"
};

// 命名空间附魔 ID 到简体中文名称的映射。
// 同时兼容省略 minecraft: 前缀以及部分版本使用的不同诅咒 ID。
var ITEM_ENCHANTMENT_ID_NAMES = {
	protection: "保护", fire_protection: "火焰保护", feather_falling: "摔落保护",
	blast_protection: "爆炸保护", projectile_protection: "弹射物保护", thorns: "荆棘",
	respiration: "水下呼吸", depth_strider: "深海探索者", aqua_affinity: "水下速掘",
	sharpness: "锋利", smite: "亡灵杀手", bane_of_arthropods: "节肢杀手",
	knockback: "击退", fire_aspect: "火焰附加", looting: "抢夺", efficiency: "效率",
	silk_touch: "精准采集", unbreaking: "耐久", fortune: "时运", power: "力量",
	punch: "冲击", flame: "火矢", infinity: "无限", luck_of_the_sea: "海之眷顾",
	lure: "饵钓", frost_walker: "冰霜行者", mending: "经验修补",
	binding: "绑定诅咒", binding_curse: "绑定诅咒", vanishing: "消失诅咒",
	vanishing_curse: "消失诅咒", impaling: "穿刺", riptide: "激流", loyalty: "忠诚",
	channeling: "引雷", multishot: "多重射击", piercing: "穿透",
	quick_charge: "快速装填", soul_speed: "灵魂疾行", swift_sneak: "迅捷潜行",
	wind_burst: "风爆", density: "蓄势猛击", breach: "破甲", lunging: "突刺"
};
/**
 * 更新商店配置
 */
function ConfigUpdate () {
    File.writeTo("plugins/shop/shopdata.json", JSON.stringify(shopConfig,null,2));
}
// const test = new JsonConfigFile("plugins/shop/test.json")
/**
 * DJB2 哈希函数
 * @param {string} str 要哈希的字符串
 * @returns {number}
 */
function hashDJB2(str) {
    let hash = 5381;
    
    for (let i = 0; i < str.length; i++) {
        // hash * 33 + charCode
        hash = ((hash << 5) + hash) + str.charCodeAt(i);
        // 转换为 32 位有符号整数
        hash = hash & 0xFFFFFFFF;
    }
    
    return hash;
}
if (!nameItem.get("history")) {
    let history = {};
    nameItem.set("history", history);
}
checkHash();
// logger.info(nameItem.get("hash"));
// logger.info(hashDJB2(JSON.stringify(shopConfig)));
// logger.info(nameItem.get("Sell"));
// logger.info(nameItem.get("Buy"));
/**
 * 检查哈希值是否一致
 */
function checkHash () {
    if (nameItem.get("hash") !== hashDJB2(JSON.stringify(shopConfig))||!nameItem.get("Sell")||!nameItem.get("Buy")) {
        nameItem.listKey().forEach(xuid => {
        if (xuid !== "history") {
            nameItem.delete(xuid);
        };//清空所有玩家的自动售出设置,而且删除sell，buy和hash的索引表
    });
    logger.info("§c商店配置已更新，自动售出设置已清空，请重新设置！");
    nameItem.set("hash", hashDJB2(JSON.stringify(shopConfig)));
    /**
     * 索引函数
     * @param {Array} data2 
     * @param {string} index 
     */
    function __index__ (data2,index) {
        let ob = {};
        data2.forEach((item) => {    
            if (item.type == "group") {
                ob = Object.assign(ob, __index__(item.data, index + "-" + item.name));
            } else if (item.type == "exam") {
                ob[item.name] = {type: "exam" , image: item.image , data: item.data, i: index};
            }});
        return ob;
    };
    // logger.info(__index__(shopConfig.Sell, ""));
    // logger.info(__index__(shopConfig.Buy, ""));
    nameItem.set("Sell", __index__(shopConfig.Sell, ""));
    nameItem.set("Buy", __index__(shopConfig.Buy, ""));    
    // test.set("Sell", __index__(shopConfig.Sell, ""));
    // test.set("Buy", __index__(shopConfig.Buy, ""));
}}
/**
 * 显示商店菜单
 * @param {Player} player 
 */
function showShopMenu(player) {
    const form = mc.newSimpleForm()
        .setTitle('§l§d商店')
        .setContent("§b请选择操作")
        .addButton("§l系统商店")
        .addButton("§l玩家商店")
        .addButton("§l搜索")
    if (player.isOP()) {
        form.addButton("§e设置系统商店")
    };
    player.sendForm(form, (pl, id) => {
        if (id === 0) showSerShopMenu(pl); // 系统商店
        if (id === 1) showPlayerShopMenu(pl); // 玩家商店
        if (id === 2) showSearchMenu(pl); // 搜索
        if (id === 3) showSetShopMenu(pl); // 设置系统商店
    });
}
function showPlayerShopMenu(player) {
    return;
}//之后再添加玩家商店的物品显示
/**
 * 创建分类
 * @param {Array} dt 分类数据
 * @param {Array} index 当前选择的分类索引
 * @returns {Array} 分类和分类名称列表
 */
function categoryCreate(dt, id, index = []) {
    let category = {name: id === "buy" ? "购买" : "出售", data: dt};
    let nameList = [category.name];
    // logger.info(category);
    if (index.length > 0) {
        category = category.data[index[0]];
        nameList.push(category.name);
    };
    if (index.length > 1) {
        for (let i = 1; i < index.length; i++) {
            category = category.data[index[i]];
            nameList.push(category.name);
        }
    }
    return [category, nameList];
}
/**
 * 显示设置系统商店菜单
 * @param {Player} player 
 */
function showSetShopMenu(player) {
    const form = mc.newSimpleForm()
        .setTitle("§l§d设置系统商店")
        .setContent("§b请选择操作")
        .addButton("§a购买")
        .addButton("§c出售")
        .addButton("返回主菜单");
    player.sendForm(form, (pl, id) => {
        if (id === 2 || (!id && id !== 0)) {
            showShopMenu(pl);
            checkHash();
        }else{
            setMenu(pl, ['Buy', 'Sell'][id]);
        }
    });
}
/**
 * 设置系统商店
 * @param {Player} player 
 * @param {String} id 购买或出售
 * @param {Array} index 当前选择的分类索引
 */
function setMenu(player, id, index = []) {
    let [category, nameList] = categoryCreate(shopConfig[id], id, index);
    // logger.info(category, nameList);

    const form = mc.newSimpleForm()
        .setTitle(`§l§d${nameList.join("-")}设置`)
        .setContent("§b请选择操作")
    category.data.forEach(item => {
        if (item.type === "exam") {
            form.addButton(`${item.name} §f(${item.data.money}金币）`, item.image);
        }else if (item.type === "group") {
            form.addButton(`${item.name} §f(${item.data.length}个内容）`, item.image);
        }
    });
    form.addButton('返回上一级')
    form.addButton('添加物品or分类')
    form.addButton('删除所在分类')
    player.sendForm(form, (pl, data) => {
        if (!data && data !== 0) {
            if (index.length > 0) {
                setMenu(pl, id, index.slice(0, -1));
                return;
            }else{
                showSetShopMenu(pl);
                return;
            }
        };
        if (data >= category.data.length) {
            if (data === category.data.length) {
                if (index.length > 0) {
                    setMenu(pl, id, index.slice(0, -1));
                    return;
                }else{
                    showSetShopMenu(pl);
                    return;
                }
            }else if (data === category.data.length + 1) {
                showAddMenu(pl, id, index);
                return;
            }else if (data === category.data.length + 2) {
                setDeleteConfirm(pl, id, index);
                return;
            }
        }
        if (category.data[data].type === "exam") {
            setExamMenu(pl, id, [...index, data]);
            return;
        }else if (category.data[data].type === "group") {
            setMenu(pl, id, [...index, data]);
            return;
        }else {
            logger.info(`§c${category.data[data].name}不是物品或分类，不能设置`);
            return;
        }
    });
}
/**
 * 确认删除分类
 * @param {Player} player 
 * @param {String} id 购买或出售
 * @param {Array} index 当前选择的分类索引
 */
function setDeleteConfirm(player, id, index) {
    let [_category, nameList] = categoryCreate(shopConfig[id], id, index);
    const form = mc.newSimpleForm()
        .setTitle(`§l§d确认删除${nameList.join("-")}吗？`)
        .setContent("§b确认删除吗？")
        .addButton("确认")
        .addButton("取消")
    player.sendForm(form, (pl, data) => {
        if (data === 0) {
            let [Parent, _nameList_] = categoryCreate(shopConfig[id], id, index.slice(0, -1));
            if (index.length > 0) {
                Parent.data.splice(index[index.length-1], 1);
                ConfigUpdate();
                setMenu(pl, id, index.slice(0, -1));
            }else if (index.length === 0) {
                shopConfig[id] = [];
                ConfigUpdate();
                showSetShopMenu(pl);
            };
            return;
        }else {
            setMenu(pl, id, index);
            return;
        }
    });
}
/**
 * 显示添加物品or分类菜单
 * @param {Player} player 
 * @param {String} id 购买或出售    
 * @param {Array} index 当前选择的分类索引
 */
function showAddMenu (player, id, index) {
    let [category, nameList] = categoryCreate(shopConfig[id], id, index);
    const form = mc.newSimpleForm()
        .setTitle(`§l§d在${nameList.join("-")}中添加物品or分类`)
        .setContent("§b请选择操作")
        .addButton("添加物品")
        .addButton("添加分类")
        .addButton("返回上一级")
    player.sendForm(form, (pl, data) => {
        if (!data && data !== 0) {
            if (index.length > 0) {
                setMenu(pl, id, index);
            }else{
                showSetShopMenu(pl);
                return;
            }
            return;
        };
        if (data === 0) {
            let Example = {
                name: "物品",
                type: "exam",
                image: "",
                data: {
                    type: null,
                    aux: 0,
                    money: null
                }
            }
            category.data.push(Example);
            ConfigUpdate();
            setExamMenu(pl, id, [...index, category.data.length - 1]);
            return;
        }else if (data === 1) {
            let Example = {
                name: "",
                type: "group",
                image: "",
                data: []
            }
            const groupNameForm = mc.newCustomForm()
                .setTitle("§l§d添加分类")
                .addLabel("§b请输入分类名称")
                .addInput("分类名称");
            player.sendForm(groupNameForm, (pl1, dataForm) => {
                if (!!dataForm?.[1] && dataForm?.[1] !== "") {
                    Example.name = dataForm[1];
                    category.data.push(Example);
                    ConfigUpdate();
                    setMenu(pl1, id, [...index, category.data.length - 1]);
                    return;
                }else {
                    showAddMenu(pl1, id, index);
                    return;
                }
            });
            }else if (data === 2) {
            setMenu(pl, id, index.slice(0, -1));
            return;
        }
    }); 
}
/**
 * 设置物品
 * @param {Player} player 
 * @param {String} id 购买或出售    
 * @param {Array} index 当前选择的分类索引
 */
function setExamMenu(player, id, index) {
    let [category, nameList] = categoryCreate(shopConfig[id], id, index);
    let inventory = player.getInventory();
    let invItems = inventory.getAllItems();
    let itemList = [];//结构：[[物品, 数量],...]
    // logger.info(invItems);
    for (let i = 0; i < invItems.length; i++) {
        if (invItems[i].count === 0) {
            continue;
        };
        if (!itemList.some(item => item[0].match(invItems[i]) === true)/*检查是否已存在*/) {
            itemList.push([invItems[i], invItems[i].count]);
        }else {
            itemList[itemList.findIndex(item => item[0].match(invItems[i]) === true)][1] += invItems[i].count;
        }
    }
    let itemNameList = itemList.map(item => {
            let [StrName, _isNeedNbt1] = parseItemInfo(item[0]);
            return [StrName, item[1]];
        })
    const from = mc.newCustomForm()
        .setTitle(`§l§d${nameList[index.length-1]}设置`)
        .addLabel("设置该物品")//0
        .addDropdown("物品", [category.name, ...itemNameList.map(item => item.join(" x"))])//1,itemList[返回值-1]
        .addSwitch('删除物品', false)//2
        .addLabel("设置价格")//3
        .addInput("价格", '', String(category.data.money));//4

    player.sendForm(from, (pl, dataForm) => {
        if (!!dataForm) {
            // logger.info(dataForm);
            // logger.info(isNeedNbt);
            let price = null;
            if (dataForm[4] !== '' && dataForm[4] !== category.data.money && dataForm[4] !== 'null') {
                try {
                    price = calculate(dataForm[4]);
                } catch (error) {
                    logger.info(`§c${error}`);
                    pl.tell(`§c${error}`);
                    return;
                };
                if (price%1 !== 0) {
                    pl.tell(`§c价格必须为整数`);
                }else if (price < 0) {
                    pl.tell(`§c价格不能为负数`);
                }else {
                    category.data.money = price;
                    ConfigUpdate();
                    pl.tell(`§a价格已设置为${price}`);
                }
            }
            if (dataForm[2]) {
                let ConfirmForm = mc.newSimpleForm()
                    .setTitle("§l§d确认删除物品")
                    .setContent("§b确认删除物品吗？")
                    .addButton("确认")
                    .addButton("取消");
                pl.sendForm(ConfirmForm, (pl1, data) => {
                    if (data === 0) {
                        let [Parent, _nameList] = categoryCreate(shopConfig[id], id, index.slice(0, -1));
                        Parent.data.splice(index[index.length-1], 1);
                        ConfigUpdate();
                        pl.tell(`§a物品已删除`);
                        setMenu(pl1, id, index.slice(0, -1));
                    }else {
                        setExamMenu(pl1, id, index);
                    }
                });
            } else if (dataForm[1] !== 0) {
                let [StrName, isNeedNbt] = parseItemInfo(itemList[dataForm[1]-1][0]);
                category.name = StrName;
                if (isNeedNbt) {
                    if (category.data?.snbt === undefined) {
                        category.data.snbt = itemList[dataForm[1]-1][0].getNbt().toSNBT();
                        ConfigUpdate();
                        pl.tell(`§a物品已设置为${StrName}`);
                    }else if (category.data?.type === undefined) {
                        delete category.data.type
                        category.data.snbt = itemList[dataForm[1]-1][0].getNbt().toSNBT();
                        ConfigUpdate();
                        pl.tell(`§a物品已设置为${StrName}`);
                    }else {
                        category.data.snbt = itemList[dataForm[1]-1][0].getNbt().toSNBT();
                        ConfigUpdate();
                        pl.tell(`§a物品已设置为${StrName}`);
                    }
                }else {
                    if (category.data?.type === undefined) {
                        category.data.type = itemList[dataForm[1]-1][0].type;
                        ConfigUpdate();
                        pl.tell(`§a物品已设置为${StrName}`);
                    }else if (category.data?.snbt !== undefined) {
                        delete category.data.snbt;
                        category.data.type = itemList[dataForm[1]-1][0].type;
                        ConfigUpdate();
                        pl.tell(`§a物品已设置为${StrName}`);
                    }else {
                        category.data.type = itemList[dataForm[1]-1][0].type;
                        ConfigUpdate();
                        pl.tell(`§a物品已设置为${StrName}`);
                    }
                }
                setMenu(pl, id, index.slice(0, -1));
                return;
            }
        }else if (!dataForm && dataForm !== 0) {
            setMenu(pl, id, index.slice(0, -1));
            return;
        }
    });
    
}
// 创建主菜单表单
/**
 * 
 * @param {Player} player 
 */
function showSerShopMenu(player) {
    const form = mc.newSimpleForm()
        .setTitle("§l§d系统商店")
        .setContent("§b请选择操作")
        .addButton("§a购买")
        .addButton("§c出售")
if (config.get("AutoSell", true)) {
        form.addButton("§e自动售出设置")
    }

    player.sendForm(form, (pl, id) => {
        if (id === 0) showBuyMenu(pl); // 购买
        if (id === 1) showSellMenu(pl); // 出售
        if (id === 2) showAutoSellMenu(pl);
    });
}
// 自动售出分类内物品选择
/**
 * 
 * @param {Player} player
 * @param {Array} index 当前选择的分类索引
 * @param {boolean} isSearch 是否为搜索结果
 * @param {Object} category 当前选择的分类
 */
function showAutoSellKind(player, index = [], isSearch = false, category = null) {
    if (!category && !isSearch){
        category = shopConfig.Sell[index[0]];
        if (index.length > 1) {
            for (let i = 1; i < index.length; i++) {
                category = category.data[index[i]];
            }
        }
    }
    const form = mc.newCustomForm()
        .setTitle(isSearch ? `§l§a搜索结果: ${category.name}` : `§l§a${category.name}分类`)
        .addLabel("选择要自动售出的物品");
    if (!!nameItem.get(player.xuid)) {
        var ob = nameItem.get(player.xuid);
    } else {
        var ob = {};
    }
    category.data.forEach(item => {
            form.addSwitch(`${item.name} §f(${item.data.money}金币）`, (!ob?.[item.data?.type || item.data?.snbt])?false:true);
    });
    player.sendForm(form, (pl, data) => {
        if (!!data) {
            for (let i = 1; i < category.data.length+1; i++) {
                if (data[i]) {
                    let ob = nameItem.get(pl.xuid) || {};
                    // if (!!nameItem.get(pl.xuid)) {
                    //     var ob = nameItem.get(pl.xuid);
                    // }else{
                    //     var ob = {};
                    // };
                    if (!ob?.[category.data[i-1].data?.type || category.data[i-1].data?.snbt]) {
                        ob[category.data[i-1].data?.type || category.data[i-1].data?.snbt] = [category.data[i-1].data.money , category.data[i-1].name];
                        let boo = nameItem.set(pl.xuid, ob);
                        if (!boo) {
                            pl.tell("§c设置失败，请联系管理员");
                        }else{
                            pl.tell(`§a已设置自动售出${category.data[i-1].name}！`);
                        }
                    }
                }else {
                    let ob = nameItem.get(pl.xuid);
                    if (!!ob) {
                        if(!!ob[category.data[i-1].data?.type || category.data[i-1].data?.snbt]){
                            delete ob[category.data[i-1].data?.type || category.data[i-1].data?.snbt];
                            let boo = nameItem.set(pl.xuid, ob);
                            if (!boo) {
                                pl.tell("§c取消设置失败，请联系管理员");
                            }else{
                                pl.tell(`§a已取消自动售出${category.data[i-1].name}！`);
                            }
                        }
                    }
                }    
            }
            return;
        }else {
            if (isSearch) {
                showSearchMenu(pl, 2);
            } else {
                showAutoSellMenu(pl, index.slice(0,-1));
            }
        }
    });
}
// 自动售出设置菜单
/**
 * 
 * @param {Player} player 
 * @param {Array} index 当前选择的分类索引
 */
function showAutoSellMenu (player,index = []) {
    let category = {};
    if (index.length !== 0) {
        category = shopConfig.Sell[index[0]];
        if (index.length > 1) {
            for (let i = 1; i < index.length; i++) {
                category = category.data[index[i]];
            }
        }
    }else if (index.length === 0) {
        category = {name : '',data : shopConfig.Sell};
    }
    const form = mc.newSimpleForm()
        .setTitle(`§l§a${category?.name}自动售出设置`)
        .setContent("选择出售的分类");

    const copySellConfig = [];
    let indexCopy = [];
    category.data.forEach((category1, index) => {
        if (category1.type == "group") {
            copySellConfig.push(category1);
            form.addButton(category1.name, category1.image);
            indexCopy.push(index);
    }});
    let others = [];
    // let indexOthers = [];
    category.data.forEach((category1) => {
        if (category1.type == "exam") {
            others.push(category1);
            // indexOthers.push(index);
        }});
    if (others.length > 0) {
        form.addButton("其他分类");
    }
    player.sendForm(form, (pl, category1Id) => {
        if (!category1Id && category1Id !== 0) {
            if (index.length === 0) {
                showSerShopMenu(pl);
                return;
            }else{
                showAutoSellMenu(pl, index.slice(0,-1));
                return;
            }
        }else if (copySellConfig[category1Id]) {
            let isAllExam = true;
            for (let i = 0; i < copySellConfig[category1Id].data.length; i++) {
                if (copySellConfig[category1Id].data[i].type != "exam") {
                    isAllExam = false;
                    break;
                }
            }
            let newIndex = index;
            newIndex.push(indexCopy[category1Id]);
            if (isAllExam) {
                showAutoSellKind(pl, newIndex);
            }else{
                showAutoSellMenu(pl, newIndex);
            }
        }else if (category1Id === copySellConfig.length && others.length > 0) {
            showAutoSellKind(pl,[...index,null],false, {name:"其他分类", image: "", data:others});
        }
    })
}
// 购买主分类菜单
/**
 * 
 * @param {Player} player 
 */
function showBuyMenu(player) {
    const form = mc.newSimpleForm()
        .setTitle("§l§a购买分类")
        .setContent("选择要购买的分类");

    shopConfig.Buy.forEach(category => {
        if (category.type == "group") {
            form.addButton(category.name, category.image);
        }else if (category.type == "exam") {
            form.addButton(`${category.name} §f(${category.data.money}金币）`, category.image);
        }
    });
    // form.addButton("§g搜索")
    form.addButton("§c返回");

    player.sendForm(form, (pl, categoryId) => {
        // logger.info(categoryId);
        if (!categoryId && categoryId !== 0) {
            showSerShopMenu(pl);
            return;
        }
        if (shopConfig.Buy[categoryId] === undefined) {
            if (categoryId === shopConfig.Buy.length) {
                showSerShopMenu(pl);
            }
            
        }else if (shopConfig.Buy[categoryId].type == "group") {
            showBuyItems(pl, [categoryId]);
        }else if (shopConfig.Buy[categoryId].type == "exam") {
            showBuyConfirm(pl, shopConfig.Buy[categoryId], 0, []);
        }
        
    });
}

/**
 * 
 * @param {Player} player 
 * @param {Array} index 索引数组
 * @param {boolean} isSearch 是否为搜索结果
 * @param {Object} category 分类数据
 * 展示分类内物品
 */
function showBuyItems(player, index=[],isSearch = false, category = {}) {
    if (index.length !== 0 && !isSearch) {
        category = shopConfig.Buy[index[0]];
        if (index.length > 1) {
        for (let i = 1; i < index.length; i++) {
            category = category.data[index[i]];
        }
        }
    }
    const form = mc.newSimpleForm()
        .setTitle(isSearch ? `§l§a搜索${category.name}` : `§l§a${category.name}分类`)
        .setContent("选择要购买的物品");

    category.data.forEach(item => {
        if (item.type == "exam") {
            form.addButton(isSearch ? `${item.name} §f(${item.data.money}金币）在${item.i}中` : `${item.name} §f(${item.data.money}金币）`, item.image);
        }else if (item.type == "group") {
            form.addButton(item.name, item.image);
        }
    });
    form.addButton("§c返回", "");

    player.sendForm(form, (pl, itemId) => {
        if (itemId === null) return;
        const selectedItem = category.data[itemId];
        if (selectedItem == undefined) {
            if (isSearch) {
                showSearchMenu(pl,0);
            } else if (index.length === 1) {
                showBuyMenu(pl);
            } else if (index.length > 1) {
                showBuyItems(pl, index.slice(0,-1));
            }
        } else {
            if (isSearch) {
                showBuyConfirm(pl, selectedItem, 2, [], category);
            }else if (selectedItem.type == "exam") {
                showBuyConfirm(pl, selectedItem, 1, index, category);
            }else if (selectedItem.type == "group") {
                showBuyItems(pl, [...index, itemId]);
            }
        }
        
    });
}
// 出售主分类菜单
/**
 * 
 * @param {Player} player 
 */
function showSellMenu(player) {
    const form = mc.newSimpleForm()
        .setTitle("§l§c出售")
        .setContent("选择要出售的");

    shopConfig.Sell.forEach(category => {
        if (category.type == "group") {
            form.addButton(category.name, category.image);
        }else if (category.type == "exam") {
            form.addButton(`${category.name} §f(${category.data.money}金币）`, category.image);
        }
    });
    // form.addButton("§g搜索");
    form.addButton("§c返回");

    player.sendForm(form, (pl, categoryId) => {
        if (!categoryId && categoryId !== 0) {
            showSerShopMenu(pl);
            return;
        };
        if (shopConfig.Sell[categoryId] === undefined) {
            if (categoryId === shopConfig.Sell.length) {
                showSerShopMenu(pl);
            }
        }else if (shopConfig.Sell[categoryId].type == "group") {
            showSellItems(pl, [categoryId]);
        }else if (shopConfig.Sell[categoryId].type == "exam") {
            showSellConfirm(pl, shopConfig.Sell[categoryId],0);
        }
    });
}
// 购买确认表单
/**
 * 
 * @param {Player} player 
 * @param {Object} itemData 
 * @param {number} indexKind 索引类型 0:主分类 1:子分类 2:搜索结果
 * @param {Array} index 索引数组
 * @param {Object} category 
 */
function showBuyConfirm(player, itemData, indexKind, index=[], category = {}) {

    const form = mc.newCustomForm()
        .setTitle("购买确认")
        .addLabel(`§l物品信息\n名称: ${itemData.name}\n单价: ${itemData.data.money}金币`)
        .addInput("购买数量", "请输入购买数量", "", "");
    

    player.sendForm(form, (pl, data) => {
        if (!data || data?.[1] === undefined || data[1] === '') {
            if (indexKind == 0) {
                showBuyMenu(pl);
                return;
            } else if (indexKind == 1) {
                showBuyItems(pl, index, false);
                return;
            } else if (indexKind == 2) {
                showBuyItems(pl, index, true, category);
                return;
            }
        }
        let count = 0;
        try {
            count = calculate(data[1]);
        } catch (e) {
            return pl.tell("§c请输入有效的数量");
        }
        if (count <= 0) return pl.tell("§c请输入有效数量");
        if (count % 1 !== 0) return pl.tell("§c请输入整数数量");
        const totalCost = itemData.data.money * count;

        // 经济验证
        const currentMoney = pl.getMoney();
        if (currentMoney < totalCost) return pl.tell("§c金币不足");

        // 扣款
        pl.setMoney(currentMoney - totalCost);
        // 恢复直接传递物品对象的方式
        if (!itemData.data?.type && !!itemData.data?.snbt) {
            let item = mc.newItem(NBT.parseSNBT(itemData.data.snbt))
            pl.giveItem(item, count)
        }else if (!!itemData.data?.type) {
            mc.runcmdEx(`give ${pl.realName} ${itemData.data.type} ${count} ${itemData.data.aux}`)//不需要检查
        } else {
            logger.error(`§c购买物品${itemData.name}失败，物品类型或NBT为空`);
            return pl.tell("§c购买物品失败");
        }
        // let bool = pl.giveItem(item,count);//这个有bug
        pl.refreshItems();
        // if(!bool)return pl.tell("§c购买失败");
        pl.tell(`§a购买${count}个${itemData.name}！花费${totalCost}金币`);
        let history = nameItem.get("history");
        history[pl.xuid+'_'+"buyCount"] = (history?.[pl.xuid+'_'+"buyCount"] || 0) + count;
        history[pl.xuid+'_'+"buyTotal"] = (history?.[pl.xuid+'_'+"buyTotal"] || 0) + totalCost;
        nameItem.set("history", history);
    });
}

// 出售物品选择
/**
 * 
 * @param {Player} player 
 * @param {Array} index 索引数组
 * @param {boolean} isSearch 是否为搜索结果
 * @param {Object} category 
 */
function showSellItems(player, index = [], isSearch = false, category = {}) {
    if (index.length !== 0 && !isSearch) {
        category = shopConfig.Sell[index[0]];
        if (index.length > 1) {
            for (let i = 1; i < index.length; i++) {
                category = category.data[index[i]];
            }
        }
    }
    const form = mc.newSimpleForm()
        .setTitle(isSearch ? `§l§c搜索结果: ${category.name}` : `§l§c${category.name}分类`)
        .setContent("选择要出售的物品");

    category.data.forEach(item => {
        if (item.type == "exam") {
            form.addButton(isSearch ? `${item.name} §f(${item.data.money}金币）在${item.i}中` : `${item.name} §f(${item.data.money}金币）`, item.image);
        }else if (item.type == "group") {
            form.addButton(item.name, item.image);
        }
        
    });
    form.addButton("§c返回");

    player.sendForm(form, (pl, itemId) => {
        if (itemId === null) return;
        const selectedItem = category.data[itemId];
        if (selectedItem === undefined) {
            if (isSearch) {
                showSearchMenu(pl, 1);
            } else if (index.length === 1) {
                showSellMenu(pl);
            }else if (index.length > 1) {
                showSellItems(pl, index.slice(0, -1), false);
            }
        } else {
            if (selectedItem.type == "group") {
                showSellItems(pl, [...index, itemId], false);
            } else if (selectedItem.type == "exam") {
                if (isSearch) {
                    showSellConfirm(pl, selectedItem, 2, [], category);
                }else {
                    showSellConfirm(pl, selectedItem, 1, index, category);
                }
            }
        }
        
        
    });
}
// 出售确认表单
/**
 * 
 * @param {Player} player 
 * @param {Object} itemData 
 * @param {number} indexKind 0:主分类 1:子分类 2:搜索结果
 * @param {Array} index 索引数组
 * @param {Object} category 
 */
function showSellConfirm(player, itemData, indexKind, index = [], category = {}) {
    let ct = player.getInventory();
    let playerItemCount = 0;
    let it = null;
    if (!itemData.data?.type && !!itemData.data?.snbt) {
        it = mc.newItem(NBT.parseSNBT(itemData.data.snbt))
    }else if (!!itemData.data?.type) {
        it = mc.newItem(itemData.data.type,1);
        it.setAux(itemData.data.aux);
    }else {
        logger.error("物品类型或SNBT为空");
        return;
    }
    for (let i = 0; i < ct.size; i++) {
        if (ct.getItem(i).match(it)) {
            playerItemCount += ct.getItem(i).count;
        }
    }
    const form = mc.newCustomForm()
        .setTitle("出售确认")
        .addLabel(`§l物品信息\n名称: ${itemData.name}\n单价: ${itemData.data.money}金币\n§l当前拥有: ${playerItemCount}个`)
        .addInput("出售数量", "请输入出售数量", '', "");

    player.sendForm(form, (pl, data) => {
        if (!data || data?.[1] === undefined || data[1] === '') {
            pl.tell("输入为空，返回上级菜单");
            if (indexKind == 0) {
                showSellMenu(pl);
            } else if (indexKind == 1) {
                showSellItems(pl, index, false, category);
            } else if (indexKind == 2) {
                showSellItems(pl, index, true, category);
            }
            return;
        }
        let count = 0;
        try {
            count = calculate(data[1]);
        } catch (e) {
            return pl.tell("§c请输入有效的数量");
        };
        if (count <= 0) return pl.tell("§c请输入有效数量");
        if (count % 1 !== 0) return pl.tell("§c请输入整数数量");
        let NotRemovedCount = count;
        for (let i = 0; i < ct.size; i++) {
            let IndexCount = ct.getItem(i).count;
            if (ct.getItem(i).match(it)) {
                if (IndexCount <= NotRemovedCount) {
                    ct.removeItem(i, IndexCount);
                    NotRemovedCount -= IndexCount;
                } else if (IndexCount > NotRemovedCount) {
                    ct.removeItem(i, NotRemovedCount);
                    NotRemovedCount = 0;
                }
            }
        }
        let clItem = 0;
        if (NotRemovedCount === 0) {
            clItem = count;
        }else if (NotRemovedCount > 0) {
            clItem = playerItemCount;
        }
        // const clItem = pl.clearItem(itemData.data.type,count)//aux以后在补
        pl.refreshItems();
        const totalGain = itemData.data.money * clItem;
        pl.setMoney(pl.getMoney() + totalGain);
        pl.tell(`§a出售${clItem}个${itemData.name}！获得${totalGain}金币`);
        let history = nameItem.get("history");
        history[pl.xuid+'_'+"sellCount"] = (history?.[pl.xuid+'_'+"sellCount"] || 0) + clItem;
        history[pl.xuid+'_'+"sellTotal"] = (history?.[pl.xuid+'_'+"sellTotal"] || 0) + totalGain; 
        nameItem.set("history", history);
    });
}
/**
 * 物品搜索表单
 * @param {Player} player 
 * @param {number} kind 搜索类别 0:购买 1:出售 2:自动出售
 */
function showSearchMenu(player, kind = 0) {
    const form = mc.newCustomForm()
        .setTitle("§l§e搜索物品")
        .addInput("请输入要搜索的物品名称", "例如: 钻石", "", "")
        .addStepSlider("搜索类别",["购买","出售","自动出售"], kind);

    player.sendForm(form, (pl, data) => {
        if (!data || data?.[0] === '') {
            pl.tell("输入为空，返回上级菜单");
            showShopMenu(pl);
            return;
        }else {
            let searchName = data[0];
            let indexOB = {};
            kind = data[1];
            if (kind === 0) {
                indexOB = nameItem.get("Buy");
            } else if (kind === 1||kind === 2) {
                indexOB = nameItem.get("Sell");
            }
            // logger.info(indexOB);
            let searchResults = [];
            Object.keys(indexOB).forEach(key => {
                if (key.includes(searchName)) {
                    let itemData = indexOB[key];
                    searchResults.push({name: key, image: itemData.image,type: "exam",data: itemData.data, i: itemData.i});
                }
          
        })
        // logger.info(searchResults);
        if (searchResults.length === 0) {
            pl.tell("§c未找到匹配的物品");
            showSearchMenu(pl, kind);
        } else {
            if (kind === 0) {
                
                showBuyItems(pl, [], true, {name: `搜索结果: ${searchName}`,data: searchResults});
            } else if (kind === 1) {
                showSellItems(pl, [], true, {name: `搜索结果: ${searchName}`, data: searchResults});
            }else if (kind === 2) {
                showAutoSellKind(pl, [], true, {name: `搜索结果: ${searchName}`, data: searchResults});
            }
        }
        
    }});
}

/**
 * 计算表达式的值
 * @param {string} expr 
 * @returns {number}
 */
function calculate(expr) {
    // ===== 1. 预处理：全角→半角、关键字归一化 =====
    expr = expr
        // 全角空格 & 等号去除
        .replace(/[\u3000＝=]/g, '')
        // 全角数字 → 半角数字
        .replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
        // 全角字母 → 半角字母
        .replace(/[Ａ-Ｚａ-ｚ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
        // 全角运算符 → 半角
        .replace(/＋/g, '+')
        .replace(/[－﹣‑]/g, '-')   // 全角减号 / Unicode 减号
        .replace(/×/g, '*')        // 乘号
        .replace(/÷/g, '/')        // 除号
        .replace(/（/g, '(')
        .replace(/）/g, ')')
        .replace(/．/g, '.')       // 全角小数点
        // 去除半角空格
        .replace(/\s+/g, '');

    let pos = 0;

    // ===== 2. 解析函数 =====

    // 检查当前位置是否匹配字符串 (不区分大小写)
    function match(str) {
        const seg = expr.substring(pos, pos + str.length);
        if (seg.toLowerCase() === str.toLowerCase()) {
            pos += str.length;
            return true;
        }
        return false;
    }

    // 加减 (最低优先级)
    function parseAddSub() {
        let left = parsePow();
        while (pos < expr.length && (expr[pos] === '+' || expr[pos] === '-')) {
            const op = expr[pos++];
            const right = parsePow();
            left = op === '+' ? left + right : left - right;
        }
        return left;
    }

    // 幂运算 ^ (右结合，比乘除高)
    function parsePow() {
        let left = parseMulDiv();
        if (pos < expr.length && expr[pos] === '^') {
            pos++;
            const right = parsePow();  // 递归右结合: 2^3^2 = 2^(3^2)
            left = Math.pow(left, right);
        }
        return left;
    }

    // 乘除取模 mod (中优先级)
    function parseMulDiv() {
        let left = parseUnary();
        while (pos < expr.length) {
            const c = expr[pos];
            if (c === '*' || c === '/' || c === '%') {
                pos++;
                const right = parseUnary();
                if (c === '*') left = left * right;
                else if (c === '/') left = left / right;
                else left = left % right;
            } else if (match('mod')) {
                const right = parseUnary();
                left = left % right;
            } else {
                break;
            }
        }
        return left;
    }

    // 一元运算符 (负数 / 正数)
    function parseUnary() {
        if (pos < expr.length && expr[pos] === '-') {
            pos++;
            return -parsePrimary();
        }
        if (pos < expr.length && expr[pos] === '+') {
            pos++;
            return parsePrimary();
        }
        return parsePrimary();
    }

    // 原子: 数字 或 括号表达式
    function parsePrimary() {
        if (pos < expr.length && expr[pos] === '(') {
            pos++;
            const val = parseAddSub();
            if (pos < expr.length && expr[pos] === ')') {
                pos++;
            }
            return val;
        }
        // 解析数字 (小数)
        let start = pos;
        while (pos < expr.length && (/\d/.test(expr[pos]) || expr[pos] === '.')) {
            pos++;
        }
        if (start === pos) {
            throw new Error('表达式错误，位置: ' + pos + ' 字符: ' + expr[pos]);
        }
        return parseFloat(expr.substring(start, pos));
    }

    // ===== 3. 执行解析 =====
    const result = parseAddSub();
    if (pos < expr.length) {
        throw new Error('表达式解析未完成，多余字符: ' + expr.substring(pos));
    }
    return result;
}

/**
 * 获取排行榜数据
 * @param {string} data1 排行类型：buyCount/sellTotal/buyTotal/sellCount
 * @returns {Array|string} 排行榜数据或错误信息
 */
function getShopRank(data1){
    let history = nameItem.get("history");
    if (data1 !== "buyCount" && data1 !== "sellTotal" && data1 !== "buyTotal" && data1 !== "sellCount"){
        return "无效的参数";
    }
    
    let rankList = [];
    let playerData = {}; // 临时存储每个玩家的数据
    
    // 遍历 history，收集指定类型的数据
    for (let key in history) {
        // key 是 [xuid, dataType] 格式
        if (key.endsWith(data1)) {
            let xuid = key.split('_')[0];
            playerData[xuid] = history[key];
        }
    }
    // logger.info(playerData);
    // 转换为排名列表
    for (let xuid in playerData) {
        let value = playerData[xuid];
        if (value > 0) {
            // logger.info(`玩家 ${xuid} 的 ${data1} 数据为 ${value}`);
            let name = data.xuid2name(xuid);
            rankList.push({name: name, data: value});
        }
    }
    
    rankList.sort((a, b) => b.data - a.data);
    return rankList;
}
/**
 * 测试指令
 * @param {Player} player 玩家对象
 */
function _test9(player){
    let hand = player.getHand();
    let snbt = hand.getNbt().toSNBT();
    let [text, isNeedNbt] = parseItemInfo(hand);
    player.tell(snbt);
    player.tell(text);
    logger.info(snbt);
    logger.info(text);
    logger.info(isNeedNbt);
}

/**
 * 将附魔等级转换为物品提示中常见的罗马数字。
 * 1 至 20 使用罗马数字，超出范围时原样输出，避免生成过长或含糊的结果。
 *
 * @param {number|string} level 附魔等级。
 * @returns {string} 罗马数字或原始等级文本。
 */
function itemRomanLevel(level) {
	// 按从大到小的顺序贪心拼接罗马数字。
	var values = [[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
	var result = "";
	var remaining = Number(level) || 0;
	var index;

	// 非常规等级直接显示实际数字，保留自定义附魔信息。
	if (remaining < 1 || remaining > 20) return String(level);
	for (index = 0; index < values.length; index++) {
		while (remaining >= values[index][0]) {
			result += values[index][1];
			remaining -= values[index][0];
		}
	}
	return result;
}

/**
 * 将数字或字符串形式的附魔 ID 转换为中文名称。
 * 未收录的数字 ID 会标记为未知附魔；未收录的字符串 ID 会保留可读名称。
 *
 * @param {number|string} id 附魔的数字 ID 或命名空间 ID。
 * @returns {string} 附魔的中文名称或可读回退名称。
 */
function itemEnchantName(id) {
	var plainId;
	// 旧版基岩 NBT 使用数字 ID。
	if (typeof id === "number" || /^\d+$/.test(String(id))) {
		return ITEM_ENCHANTMENT_NAMES[Number(id)] || "未知附魔(" + id + ")";
	}
	// 新式字符串 ID 先移除原版命名空间，再查询中文映射。
	plainId = String(id).replace(/^minecraft:/, "");
	return ITEM_ENCHANTMENT_ID_NAMES[plainId] || plainId.replace(/_/g, " ");
}

/**
 * 递归扫描普通 JavaScript 形式的物品 NBT，收集附魔名称与等级。
 * 同时支持基岩版列表结构和部分新式键值结构。
 *
 * @param {*} value 当前扫描的 NBT 值。
 * @param {string[]} result 用于累计附魔描述的数组。
 * @param {string} parentKey 当前值在父对象中的键名。
 * @returns {void}
 */
function itemFindEnchantments(value, result, parentKey) {
	var index;
	var keys;
	var id;
	var level;

	// 基础类型不可能继续包含附魔信息，直接结束本次递归。
	if (!value || typeof value !== "object") return;
	if (Array.isArray(value)) {
		// 基岩版常见结构：tag.ench = [{ id: 9, lvl: 5 }]。
		if (/^(ench|enchantments|storedenchantments|stored_enchantments)$/i.test(parentKey || "")) {
			for (index = 0; index < value.length; index++) {
				if (!value[index] || typeof value[index] !== "object") continue;
				id = value[index].id;
				if (id === undefined) id = value[index].Id;
				level = value[index].lvl;
				if (level === undefined) level = value[index].level;
				if (level === undefined) level = value[index].Level;
				if (id !== undefined && level !== undefined) {
					result.push(itemEnchantName(id) + " " + itemRomanLevel(level));
				}
			}
		}
		// 列表元素仍可能包含嵌套的物品或附魔数据，因此继续递归。
		for (index = 0; index < value.length; index++) itemFindEnchantments(value[index], result, parentKey);
		return;
	}

	keys = Object.keys(value);
	// 兼容形如 enchantments: { "minecraft:sharpness": 5 } 的键值结构。
	if (/^(enchantments|stored_enchantments)$/i.test(parentKey || "")) {
		for (index = 0; index < keys.length; index++) {
			if (typeof value[keys[index]] === "number") {
				result.push(itemEnchantName(keys[index]) + " " + itemRomanLevel(value[keys[index]]));
			}
		}
	}
	// 扫描所有子对象，以覆盖附魔书及嵌套容器中的不同 NBT 层级。
	for (index = 0; index < keys.length; index++) {
		itemFindEnchantments(value[keys[index]], result, keys[index].replace(/^minecraft:/, ""));
	}
}

/**
 * 规范化 NBT 对象，以便稳定比较当前物品和同类型默认物品。
 * 忽略数量、槽位等不决定物品特殊内容的字段，并固定对象键顺序。
 *
 * @param {*} value 待规范化的 NBT 值。
 * @returns {*} 规范化后的深拷贝值。
 */
function itemNormalizeNbt(value) {
	// 数量由外部字段单独保存；槽位和拾取状态不属于物品自身特征。
	var ignoredKeys = { Count: true, count: true, Slot: true, WasPickedUp: true };
	var result;
	var keys;
	var index;

	// 数组保持原顺序，因为 NBT List 的元素顺序可能影响游戏行为。
	if (Array.isArray(value)) return value.map(itemNormalizeNbt);
	if (!value || typeof value !== "object") return value;

	result = {};
	// 排序后再序列化，避免仅由对象键顺序造成误判。
	keys = Object.keys(value).sort();
	for (index = 0; index < keys.length; index++) {
		if (!ignoredKeys[keys[index]]) result[keys[index]] = itemNormalizeNbt(value[keys[index]]);
	}
	return result;
}

/**
 * 判断物品是否需要额外保存 SNBT 才能无损还原。
 * 方法是将当前物品与 mc.newItem 创建的同类型默认物品进行规范化比较。
 *
 * @param {Object} item LegacyScriptEngine Item 对象。
 * @param {Object} nbtObject 当前物品通过 toObject() 得到的 NBT。
 * @returns {boolean} 无法只用类型和数量还原时返回 true。
 */
function itemNeedsSnbt(item, nbtObject) {
	var defaultItem;
	var defaultNbt;
	// 只要物品具有耐久、附魔或特殊附加值，就按带属性物品处理并保存 SNBT。
	// 即使工具当前为满耐久，其可损坏属性也会使本函数返回 true。
	if (item.isDamageableItem || item.isEnchanted || Number(item.aux || 0) !== 0) return true;
	// 离开 LSE 环境时无法取得可靠的默认物品，采取保守策略要求保存 SNBT。
	if (typeof mc === "undefined" || !mc || typeof mc.newItem !== "function") return true;

	defaultItem = mc.newItem(item.type, item.count || 1);
	// 自定义物品或无效类型可能无法生成默认物品，此时必须保留原 NBT。
	if (!defaultItem || (typeof defaultItem.isNull === "function" && defaultItem.isNull())) return true;

	defaultNbt = defaultItem.getNbt().toObject();
	// 规范化结果存在任意差异，就说明类型和数量不足以完整还原该物品。
	return JSON.stringify(itemNormalizeNbt(nbtObject)) !== JSON.stringify(itemNormalizeNbt(defaultNbt));
}

/**
 * 根据 NBT 中的特征键生成常见特殊数据标签。
 * 标签只用于中文摘要；是否需要 SNBT 仍由完整 NBT 比较决定。
 *
 * @param {Object} nbtObject 物品的普通 JavaScript NBT 对象。
 * @returns {string[]} 检测到的特殊数据中文标签。
 */
function itemSpecialDataLabels(nbtObject) {
	// 序列化后统一搜索，可覆盖字段位于不同 NBT 深度的情况。
	var text = JSON.stringify(nbtObject || {});
	var labels = [];
	// 下列特征键覆盖药水、纹饰、容器、烟花、地图和书本等常见特殊物品。
	if (/Potion|potion/i.test(text)) labels.push("药水数据");
	if (/Trim|trim/i.test(text)) labels.push("盔甲纹饰");
	if (/BlockEntityTag|Items|bundle_contents|container/i.test(text)) labels.push("容器数据");
	if (/Fireworks|Explosion/i.test(text)) labels.push("烟花数据");
	if (/map_uuid|map_id|MapId/i.test(text)) labels.push("地图数据");
	if (/author|pages|written_book/i.test(text)) labels.push("书本数据");
	return labels;
}

/**
 * 创建解析结果。
 * 返回值本身是数组，可使用 var result = ... 后按下标读取，也可进行数组解构；
 * 同时挂载命名属性，兼容 result.text 和 result.needSnbt 的原有调用方式。
 *
 * @param {string} text 物品中文摘要。
 * @param {boolean} needSnbt 是否需要保存 SNBT。
 * @returns {Array} [text, needSnbt]，并包含同名属性 text 和 needSnbt。
 */
function itemParseResult(text, needSnbt) {
	var result = [text, needSnbt];
	result.text = text;
	result.needSnbt = needSnbt;
	return result;
}

/**
 * 解析 LegacyScriptEngine 物品并生成中文摘要及 SNBT 存储建议。
 * 字符串输入会先通过 mc.newItem 创建一个数量为 1 的默认物品。
 *
 * @param {Object|string} itemOrType LSE Item 对象或 minecraft: 开头的物品类型 ID。
 * @returns {Array} [中文摘要, 是否需要保存 SNBT]，也可通过 .text 和 .needSnbt 读取。
 * @throws {Error} 字符串输入脱离 LSE 环境时抛出错误。
 * @throws {TypeError} 输入不是物品 ID 或有效的 LSE Item 对象时抛出错误。
 */
function parseItemInfo(itemOrType) {
	var item = itemOrType;
	var nbt;
	var nbtObject;
	var parts = [];
	var enchantments = [];
	var lore;
	var remainingDurability;
	var needSnbt;
	var specialLabels;

	// 允许调用者直接传入物品类型，便于解析原版默认物品。
	if (typeof itemOrType === "string") {
		if (typeof mc === "undefined" || !mc || typeof mc.newItem !== "function") {
			throw new Error("传入物品 ID 时需要在 LegacyScriptEngine 环境中调用");
		}
		item = mc.newItem(itemOrType, 1);
	}
	// 空槽位和无效物品使用固定结果，不进入 NBT 读取流程。
	if (!item || (typeof item.isNull === "function" && item.isNull())) {
		return itemParseResult("空物品", false);
	}
	if (!item.type || typeof item.getNbt !== "function") {
		throw new TypeError("parseItemInfo 需要物品 ID 或 LSE Item 对象");
	}

	// 一次性转为普通对象，后续解析和比较共用同一份 NBT 快照。
	nbt = item.getNbt();
	nbtObject = nbt.toObject();
	// LSE 的 item.name 已是游戏内显示名称；不可用时回退到标准类型 ID。
	parts.push(String(item.name || item.type));

	// 递归提取附魔，并去除递归扫描可能产生的重复描述。
	itemFindEnchantments(nbtObject, enchantments, "");
	if (enchantments.length) parts.push("附魔：" + enchantments.filter(function (name, index, all) {
		return all.indexOf(name) === index;
	}).join("、"));

	// LSE 的 damage 表示已损耗耐久，因此剩余耐久为 maxDamage - damage。
	if (item.isDamageableItem && Number(item.maxDamage) > 0) {
		remainingDurability = Math.max(0, Number(item.maxDamage) - Number(item.damage || 0));
		parts.push("耐久：" + remainingDurability + "/" + item.maxDamage);
	}

	// 过滤空 Lore 行，避免摘要中产生无意义分隔符。
	lore = Array.isArray(item.lore) ? item.lore.filter(function (line) { return String(line).length > 0; }) : [];
	if (lore.length) parts.push("Lore：" + lore.join(" / "));

	specialLabels = itemSpecialDataLabels(nbtObject);
	if (specialLabels.length) parts.push(specialLabels.join("、"));

	// 任何显式属性或完整 NBT 差异都需要保存 SNBT。
	needSnbt = enchantments.length > 0 || lore.length > 0 || specialLabels.length > 0 || itemNeedsSnbt(item, nbtObject);
	// 存在差异但没有命中已知摘要项时，给出通用的特殊数据提示。
	if (needSnbt && !enchantments.length && !item.isDamaged && !lore.length && !specialLabels.length) {
		parts.push("含特殊数据");
	}
	return itemParseResult(parts.join(" - "), needSnbt);
}

function isIndex(key) {
  return typeof key === 'number' || /^\d+$/.test(String(key))
}

/**
 * 深度设置对象属性值。
 * @param {Object} obj 要操作的对象。
 * @param {string[]} path 要设置的属性路径，每个元素为属性名。
 * @param {*} value 要设置的值。
 * @returns {Object} 修改后的对象。
 */
function setDeep(obj, path, value) {
  if (!Array.isArray(path) || path.length === 0) {
    return obj
  }

  let current = obj

  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i]
    const nextKey = path[i + 1]

    if (current[key] == null || typeof current[key] !== 'object') {
      current[key] = isIndex(nextKey) ? [] : {}
    }

    current = current[key]
  }

  current[path[path.length - 1]] = value

  return obj
}

/**
 * 显示排行榜
 * @param {Player} player 玩家对象
 */
function showRank(player) {
    const form = mc.newSimpleForm()
        .setTitle("商店排行榜")
        .setContent("请选择要查看的排行榜类型：")
        .addButton("购买次数排行榜")
        .addButton("销售次数排行榜")
        .addButton("购买总金额排行榜")
        .addButton("销售总金额排行榜")
    player.sendForm(form,(pl,data) => {
        if(!data && data !== 0){
            return;
        }else{
            let arr = ["buyCount","sellCount","buyTotal","sellTotal"];
            let cnArr = ["购买次数","销售次数","购买总金额","销售总金额"];
            let unit = ["次","次","金币","金币"];

            let rankList = getShopRank(arr[data]);
            const form2 = mc.newSimpleForm()
                .setTitle(`商店${cnArr[data]}排行榜`)
                .setContent(`玩家${cnArr[data]}排行榜：`)
            function __color__(i) {
                switch(i) {
                    case 0: return "§l§6";
                    case 1: return "§l§7";
                    case 2: return "§l§v";
                    default: return "§l";
                }
            }
            for(let i = 0;i < rankList.length;i++){
                let item = rankList[i];
                form2.addLabel(`${__color__(i)}${i+1}. ${item.name}: ${item.data}${unit[data]}`);  
            }
            pl.sendForm(form2,() => {
                return;
            });
        }
    });
   }
ll.exports(getShopRank,"shopRank", "getShopRank")//获取排行榜数据
// 指令注册
const shopCommand = mc.newCommand("shop", "打开商店",PermType.Any);
shopCommand.setEnum("openShop", ["open"]);
shopCommand.setEnum("AutoSellList", ["list"]);
shopCommand.setEnum("test", ["test"]);
shopCommand.setEnum("rank", ["rank"]);
shopCommand.mandatory('action', ParamType.Enum, "openShop",1);
shopCommand.mandatory('action', ParamType.Enum, "AutoSellList",1);
shopCommand.mandatory('action', ParamType.Enum, "rank",1);
shopCommand.mandatory('action', ParamType.Enum, "test",1);
shopCommand.overload(["openShop"]);
shopCommand.overload(["AutoSellList"]);
shopCommand.overload(["rank"]);
shopCommand.overload(["test"]);
shopCommand.setCallback((_cmd, ori, out, res) => {
    const player = ori.player;
    switch (res.action) {
        case "open":
            showShopMenu(player);
            return;
        case "list":
        let data2 = nameItem.get(player.xuid);
        if(!!data2){
            let msg = "§l§a自动售出物品列表\n";
            for(let type in data2){
                let itemData = data2[type];
                msg += `§f${itemData[1]} §f(${itemData[0]}金币）\n`;
            }
            return out.success(msg);
        }else {
            return out.success("没有找到自动售出的物品。");
        }
        case "rank":
            showRank(player);
            return;
        case 'test':
            _test9(player);
            return;
    }
});
shopCommand.setup();

setInterval(() => {
    mc.getOnlinePlayers().forEach(player => {
        let data2 = nameItem.get(player.xuid);
        if(!!data2){
            for(let type in data2){
                let itemData = data2[type];
                let item = null;
                if (type[0] === '{') {
                    item = mc.newItem(NBT.parseSNBT(type));
                } else {
                    item = mc.newItem(type,1);
                }
                let ct = player.getInventory();
                let count = 0;
                for (let i = 0; i < ct.size; i++) {
                    if (ct.getItem(i).match(item)) {
                        count += ct.getItem(i).count;
                        ct.removeItem(i, ct.getItem(i).count)
                    }
                }
                player.refreshItems();

                // let num = player.clearItem(type, 99999);
                if(count > 0){
                    let totalGain = itemData[0] * count;
                    if (player.addMoney(totalGain)) {
                        player.tell(`§a自动售出${count}个${itemData[1]}！获得${totalGain}金币`);
                        // 更新历史记录
                        let history = nameItem.get("history");
                        history[player.xuid+'_'+"sellCount"] = (history?.[player.xuid+'_'+"sellCount"] || 0) + count;
                        history[player.xuid+'_'+"sellTotal"] = (history?.[player.xuid+'_'+"sellTotal"] || 0) + totalGain; 
                        nameItem.set("history", history);
                    }
                }
            }
        }
    })
}, config.get("AutoSellTime", 60) * 1000);
