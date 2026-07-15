// LiteLoader-AIDS automatic generated
/// <reference path="d:\ll/dts/helperlib/src/index.d.ts"/> 



// 读取商店配置
/**
 * @type {Object}
 */
const shopConfig = JSON.parse(File.readFrom("plugins/shop/shopdata.json"));
const nameItem = new KVDatabase("plugins/shop/db")
const config = new JsonConfigFile("plugins/shop/config.json", "{\"AutoSell\": true,\"AutoSellTime\": 60}");
// const test = new JsonConfigFile("plugins/shop/test.json")
/**
 * DJB2 哈希函数
 * @param {string} str 
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
if (nameItem.get("hash") !== hashDJB2(JSON.stringify(shopConfig))||nameItem.get("hash") === null) {
    if (nameItem.get("hash") !== null) {
            nameItem.listKey().forEach(xuid => {
            nameItem.delete(xuid);//清空所有玩家的自动售出设置,而且删除sell，buy和hash的索引表
        });
        mc.broadcast("§c商店配置已更新，自动售出设置已清空，请重新设置！");
    };
    nameItem.set("hash", hashDJB2(JSON.stringify(shopConfig)));
    /**
     * 索引函数
     * @param {Array} data 
     * @param {string} index 
     */
    function __index__ (data,index) {
        let ob = {};
        data.forEach((item, i) => {
            if (item.type == "group") {
                ob = Object.assign(ob, __index__(item.data, index + "-" + item.name));
            } else if (item.type == "exam") {
                ob[item.name] = {type: item.data.type , image: item.image , data: item.data, i: index};
            }});
        return ob;
    };
    nameItem.set("Sell", __index__(shopConfig.Sell, ""));
    nameItem.set("Buy", __index__(shopConfig.Buy, ""));    
    // test.set("Sell", __index__(shopConfig.Sell, ""));
    // test.set("Buy", __index__(shopConfig.Buy, ""));
}

// 创建主菜单表单
/**
 * 
 * @param {Player} player 
 */
function showShopMenu(player) {
    const form = mc.newSimpleForm()
        .setTitle("§l§d商店系统")
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
 * @param {Object} category
 */
function showAutoSellKind(player, category, isSearch = false) {
    const form = mc.newCustomForm()
        .setTitle(isSearch ? `§l§a搜索结果: ${category.name}` : `§l§a${category.name}分类`)
        .addLabel("选择要自动售出的物品");
    category.data.forEach(item => {
        if (!!nameItem.get(player.xuid)) {
            var ob = nameItem.get(player.xuid);
        } else {
            var ob = {};
        }
        form.addSwitch(`${item.name} §f(${item.data.money}金币）`, (!ob?.[item.data.type])?false:true);
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
                    if (!ob?.[category.data[i-1].data.type]) {
                        ob[category.data[i-1].data.type] = [category.data[i-1].data.money , category.data[i-1].name];
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
                        if(!!ob[category.data[i-1].data.type]){
                            delete ob[category.data[i-1].data.type];
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
        }else {
            if (isSearch) {
                showSearchMenu(pl, "Sellauto");
            } else {
                showAutoSellMenu(pl);
            }
        }
    });
    
}
// 自动售出设置菜单
/**
 * 
 * @param {Player} player 
 */
function showAutoSellMenu (player) {
    const form = mc.newSimpleForm()
        .setTitle("§l§a自动售出设置")
        .setContent("选择出售的分类");
    const copySellConfig = [];
    shopConfig.Sell.forEach(category => {
        if (category.type == "group") {
            copySellConfig.push(category);
            form.addButton(category.name, category.image);
        }});
    let others = [];
    shopConfig.Sell.forEach(category => {
        if (category.type == "exam") {
            others.push(category);
        }});
    if (others.length > 0) {
        form.addButton("其他分类");
    }
    form.addButton("搜索");
    player.sendForm(form, (pl, categoryId) => {
        if (categoryId === null) return;
        if (copySellConfig[categoryId]) {
            showAutoSellKind(pl, copySellConfig[categoryId]);
        } else if (categoryId === copySellConfig.length && others.length > 0) {
            showAutoSellKind(pl, {name:"其他分类", image: "", data:others});
        }else if ((categoryId === copySellConfig.length + 1 && others.length > 0) || (categoryId === copySellConfig.length && others.length === 0)) {
            showSearchMenu(pl, "Sellauto");
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
    form.addButton("§g搜索");
    form.addButton("§c返回");

    player.sendForm(form, (pl, categoryId) => {
        if (categoryId === null) {
            showShopMenu(pl);
            return;
        }
        if (shopConfig.Buy[categoryId] === undefined) {
            if (categoryId === shopConfig.Buy.length) {
                showSearchMenu(pl,"Buy");
            }else if (categoryId === shopConfig.Buy.length + 1) {
                showShopMenu(pl);
            }
            
        }else if (shopConfig.Buy[categoryId].type == "group") {
            showBuyItems(pl, shopConfig.Buy[categoryId]);
        }else if (shopConfig.Buy[categoryId].type == "exam") {
            showBuyConfirm(pl, shopConfig.Buy[categoryId],0);
        }
        
    });
}

/**
 * 
 * @param {Player} player 
 * @param {Object} category 
 * @param {boolean} isSearch 是否为搜索结果
 * 展示分类内物品
 */
function showBuyItems(player, category,isSearch = false) {
    const form = mc.newSimpleForm()
        .setTitle(isSearch ? `§l§a搜索${category.name}` : `§l§a${category.name}分类`)
        .setContent("选择要购买的物品");

    category.data.forEach(item => {
        form.addButton(isSearch ? `${item.name} §f(${item.data.money}金币）在${item.i}中` : `${item.name} §f(${item.data.money}金币）`, item.image);
    });
    form.addButton("§c返回", "");

    player.sendForm(form, (pl, itemId) => {
        if (itemId === null) return;
        const selectedItem = category.data[itemId];
        if (selectedItem == undefined) {
            if (isSearch) {
                showSearchMenu(pl, "Buy");
            } else {
                showBuyMenu(pl);
            }
        } else {
            if (isSearch) {
                showBuyConfirm(pl, selectedItem, 2, category);
            }else {
                showBuyConfirm(pl, selectedItem, 1, category);
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
    form.addButton("§g搜索");
    form.addButton("§c返回");

    player.sendForm(form, (pl, categoryId) => {
        if (categoryId === null) {
            showShopMenu(pl);
            return;
        };
        if (shopConfig.Sell[categoryId] === undefined) {
            if (categoryId === shopConfig.Sell.length) {
                showSearchMenu(pl,"Sell");
            }else if (categoryId === shopConfig.Sell.length + 1) {
                showShopMenu(pl);
            }
        }else if (shopConfig.Sell[categoryId].type == "group") {
            showSellItems(pl, shopConfig.Sell[categoryId]);
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
 * @param {number} index 
 * @param {Object} category 
 */
function showBuyConfirm(player, itemData,index,category = null) {
    const form = mc.newCustomForm()
        .setTitle("购买确认")
        .addLabel(`§l物品信息\n名称: ${itemData.name}\n单价: ${itemData.data.money}金币`)
        .addInput("购买数量", "请输入购买数量", "", "");

    player.sendForm(form, (pl, data) => {
        if (!data || data?.[1] === undefined || data[1] === '') {
            if (index == 0) {
                showBuyMenu(pl);
                return;
            } else if (index == 1) {
                showBuyItems(pl,category);
                return;
            } else if (index == 2) {
                showBuyItems(pl,category,true);
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
        mc.runcmdEx(`give ${pl.realName} ${itemData.data.type} ${count}`)//不需要检查
        // let bool = pl.giveItem(item,count);//这个有bug
        pl.refreshItems();
        // if(!bool)return pl.tell("§c购买失败");
        pl.tell(`§a购买${count}个${itemData.name}！花费${totalCost}金币`);
    });
}

// 出售物品选择
/**
 * 
 * @param {Player} player 
 * @param {Object} category 
 * @param {boolean} isSearch 是否为搜索结果
 */
function showSellItems(player, category,isSearch = false) {
    const form = mc.newSimpleForm()
        .setTitle(isSearch ? `§l§c搜索结果: ${category.name}` : `§l§c${category.name}分类`)
        .setContent("选择要出售的物品");

    category.data.forEach(item => {
        form.addButton(isSearch ? `${item.name} §f(${item.data.money}金币）在${item.i}中` : `${item.name} §f(${item.data.money}金币）`, item.image);
    });
    form.addButton("§c返回");

    player.sendForm(form, (pl, itemId) => {
        if (itemId === null) return;
        const selectedItem = category.data[itemId];
        if (selectedItem === undefined) {
            if (isSearch) {
                showSearchMenu(pl, "Sell");
            } else {
                showSellMenu(pl);
            }
        } else {
            if (isSearch) {
                showSellConfirm(pl, selectedItem, 2, category);
            }else {
                showSellConfirm(pl, selectedItem, 1, category);
            }
        }
        
        
    });
}
// 出售确认表单
/**
 * 
 * @param {Player} player 
 * @param {Object} itemData 
 * @param {number} index 
 * @param {Object} category 
 */
function showSellConfirm(player, itemData,index,category) {
    let ct = player.getInventory();
    let playerItemCount = 0;
    for (let i = 0; i < ct.size; i++) {
        if (ct.getItem(i).type == itemData.data.type) {
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
            if (index == 0) {
                showSellMenu(pl);
            } else if (index == 1) {
                showSellItems(pl, category);
            } else if (index == 2) {
                showSellItems(pl, category, true);
            }
            return;
        }
        // if (data[1]) {
        //     var before = pl.getExtraData("autoSell");
        //     if (before == null) {
        //         before = {};
        //     };
        //
        //     before[itemData.data.type] = itemData.data.money;
        //     if (nameItem.get(itemData.data.type) === null|| nameItem.get(itemData.data.type) == undefined) {
        //         nameItem.set(itemData.data.type, itemData.name);
        //     };
        //     pl.setExtraData("autoSell", before);
        // }
        let count = 0;
        try {
            count = calculate(data[1]);
        } catch (e) {
            return pl.tell("§c请输入有效的数量");
        };
        if (count <= 0) return pl.tell("§c请输入有效数量");
        if (count % 1 !== 0) return pl.tell("§c请输入整数数量");
        const clItem = pl.clearItem(itemData.data.type,count)//aux以后在补
        pl.refreshItems();
        const totalGain = itemData.data.money * clItem;

        // 修改：通过物品栏容器移除物品
        // const inventory = pl.getInventory();
        // inventory.removeItem(itemData.data.type, itemData.data.aux, count);
        
        // 增加金币
        pl.setMoney(pl.getMoney() + totalGain);

        pl.tell(`§a出售${clItem}个${itemData.name}！获得${totalGain}金币`);
    });
}
/**
 * 物品搜索表单
 * @param {Player} player 
 * @param {string} mode Buy/Sell
 */
function showSearchMenu(player, mode) {
    const form = mc.newCustomForm()
        .setTitle("§l§e搜索物品")
        .addInput("请输入要搜索的物品名称", "例如: 钻石", "", "");

    player.sendForm(form, (pl, data) => {
        if (!data || data?.[0] === '') {
            pl.tell("输入为空，返回上级菜单");
            if (mode === "Buy") {
                showBuyMenu(pl);
            } else if (mode === "Sell") {
                showSellMenu(pl);
            }
            return;
        }else {
            let searchName = data[0];
            let indexOB = {};
            if (mode === "Buy") {
                indexOB = nameItem.get("Buy");
            } else if (mode === "Sell" || mode === "Sellauto") {
                indexOB = nameItem.get("Sell");
            }
            let searchResults = [];
            Object.keys(indexOB).forEach(key => {
                if (key.includes(searchName)) {
                    let itemData = indexOB[key];
                    searchResults.push({name: key, image: itemData.image, data: itemData.data, i: itemData.i});
                }
          
        })
        if (searchResults.length === 0) {
            pl.tell("§c未找到匹配的物品");
            showSearchMenu(pl, mode);
        } else {
            if (mode === "Buy") {
                showBuyItems(pl, {name: `搜索结果: ${searchName}`, data: searchResults}, true);
            } else if (mode === "Sell") {
                showSellItems(pl, {name: `搜索结果: ${searchName}`, data: searchResults}, true);
            }else if (mode === "Sellauto") {
                showAutoSellKind(pl, {name: `搜索结果: ${searchName}`, data: searchResults},true);
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

// 指令注册
const shopCommand = mc.newCommand("shop", "打开商店",PermType.Any);
shopCommand.setEnum("openShop", ["open"]);
shopCommand.setEnum("AutoSellList", ["list"]);
shopCommand.mandatory('action', ParamType.Enum, "openShop",1);
shopCommand.mandatory('action', ParamType.Enum, "AutoSellList",1);
shopCommand.overload(["openShop"]);
shopCommand.overload(["AutoSellList"]);
shopCommand.setCallback((_cmd, ori, out, res) => {
    const player = ori.player;
    switch (res.action) {
        case "open":
            showShopMenu(player);
            return;
        case "list":
        let data = nameItem.get(player.xuid);
        if(!!data){
            let msg = "§l§a自动售出物品列表\n";
            for(let type in data){
                let itemData = data[type];
                msg += `§f${itemData[1]} §f(${itemData[0]}金币）\n`;
            }
            return out.success(msg);
        }else {
            return out.success("没有找到自动售出的物品。");
        }
    }
});

setInterval(() => {
    mc.getOnlinePlayers().forEach(player => {
        let data = nameItem.get(player.xuid);
        if(!!data){
            for(let type in data){
                let itemData = data[type];
                let num = player.clearItem(type, 99999);
                if(num > 0){
                    player.refreshItems();
                    let totalGain = itemData[0] * num;
                    if (player.addMoney(totalGain)) {
                        player.tell(`§a自动售出${num}个${itemData[1]}！获得${totalGain}金币`);
                    }
                }
            }
        }
    })}, config.get("AutoSellTime", 60) * 1000); // 每分钟检查一次自动售出设置
