// LiteLoader-AIDS automatic generated
/// <reference path="d:\ll/dts/helperlib/src/index.d.ts"/> 



// 读取商店配置
/**
 * @type {Object}
 */
const shopConfig = JSON.parse(File.readFrom("plugins/shop/shopdata.json"));
const nameItem = new KVDatabase("plugins/shop/db")
// 创建主菜单表单
/**
 * 
 * @param {Player} player 
 */
function showShopMenu(player) {
    const form = mc.newSimpleForm()
        .setTitle("§l§d商店系统")
        .setContent("§b请选择操作")
        .addButton("§a购买", "")
        .addButton("§c出售", "")
        .addButton("§c自动售出设置", "");


    player.sendForm(form, (pl, id) => {
        if (id === 0) showBuyMenu(pl); // 购买
        if (id === 1) showSellMenu(pl); // 出售
        if (id === 2) showAutoSellMenu(pl);
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
            form.addButton(category.name, "");
        }});
    var others = [];
    shopConfig.Sell.forEach(category => {
        if (category.type == "exam") {
            others.push(category);
        }});
    if (others.length > 0) {
        form.addButton("其他分类");
    }
    player.sendForm(form, (pl, categoryId) => {
        if (categoryId === null) return;
        if (copySellConfig[categoryId]) {
            showAutoSellIKind(pl, copySellConfig[categoryId]);
        } else {
            showAutoSellKind(pl, {name:"其他分类",data:others});
        }});
}
// 自动售出分类内物品选择
/**
 * 
 * @param {Player} player
 * @param {Object} category
 */
function showAutoSellIKind(player, category) {
    const form = mc.newCustomForm()
        .setTitle(`§l§a${category.name}分类`)
        .addLabel("选择要自动售出的物品");
    category.data.forEach(item => {
        if (!!nameItem.get(player.xuid)) {
            var ob = nameItem.get(player.xuid);
        }
        form.addSwitch(`${item.name} §f(${item.data.money}金币）`, (!ob?.[item.data.type])?false:true);
    });
    player.sendForm(form, (pl, data) => {
        if (!!data) {
            for (let i = 1; i < category.data.length; i++) {
                if (data[i]) {
                    if (!!nameItem.get(pl.xuid)) {
                        var ob = nameItem.get(pl.xuid);
                    }else{
                        var ob = {};
                    };
                    ob[category.data[i-1].data.type] = [category.data[i-1].data.money,category.data[i-1].name];
                    nameItem.set(pl.xuid, ob);
                }else {
                    if (!!nameItem.get(pl.xuid)) {
                        if(!!nameItem.get(pl.xuid)[category.data[i-1].data.type]){
                            var ob = nameItem.get(pl.xuid);
                            delete ob[category.data[i-1].data.type];
                            nameItem.set(pl.xuid, ob);
                        }
                    }
                }
            }
        }else {
            showAutoSellMenu(pl);
        }
    });
    
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
            form.addButton(category.name, "");
        }else if (category.type == "exam") {
            form.addButton(`${category.name} §f(${category.data.money}金币）`, `${category.image}`);
        }
    });
    form.addButton("§c返回", "");

    player.sendForm(form, (pl, categoryId) => {
        if (categoryId === null) return;
        if (shopConfig.Buy[categoryId] === undefined) {
            showShopMenu(pl);
        }else if (shopConfig.Buy[categoryId].type == "group") {
            showBuyItems(pl, shopConfig.Buy[categoryId]);
        }else if (shopConfig.Buy[categoryId].type == "exam") {
            showBuyConfirm(pl, shopConfig.Buy[categoryId]);
        }
        
    });
}

// 展示分类内物品
/**
 * 
 * @param {Player} player 
 * @param {Object} category 
 */
function showBuyItems(player, category) {
    const form = mc.newSimpleForm()
        .setTitle(`§l§a${category.name}分类`)
        .setContent("选择要购买的物品");

    category.data.forEach(item => {
        form.addButton(`${item.name} §f(${item.data.money}金币）`, "");
    });
    form.addButton("§c返回", "");

    player.sendForm(form, (pl, itemId) => {
        if (itemId === null) return;
        const selectedItem = category.data[itemId];
        if (selectedItem == undefined) {
            showBuyMenu(pl);
        } else{
            showBuyConfirm(pl, selectedItem,1,category);
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
            form.addButton(category.name, "");
        }else if (category.type == "exam") {
            form.addButton(`${category.name} §f(${category.data.money}金币）`, `${category.image}`);
        }
    });
    form.addButton("§c返回", "");

    player.sendForm(form, (pl, categoryId) => {
        if (categoryId === null) return;
        if (shopConfig.Sell[categoryId] === undefined) {
            showShopMenu(pl);
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
function showBuyConfirm(player, itemData,index,category) {
    const form = mc.newCustomForm()
        .setTitle("购买确认")
        .addLabel(`§l物品信息\n名称: ${itemData.name}\n单价: ${itemData.data.money}金币`)
        .addInput("购买数量", "请输入购买数量", "", "");

    player.sendForm(form, (pl, data) => {
        if (!data) {
            if (index == 0) {
                showBuyMenu(pl);
            } else if (index == 1) {
                showBuyItems(pl,category);
            }
        }
        if (!data || data[1] <= 0) return pl.tell("§c请输入有效数量");
        
        const count = parseInt(data[1]);
        const totalCost = itemData.data.money * count;

        // 经济验证
        const currentMoney = pl.getMoney();
        if (currentMoney < totalCost) return pl.tell("§c金币不足");

        // 扣款
        pl.setMoney(currentMoney - totalCost);
        var item = mc.newItem(itemData.data.type,1);
        // 恢复直接传递物品对象的方式
        mc.runcmdEx(`give ${pl.realName} ${item.type} ${count}`)
        // let bool = pl.giveItem(item,count);
        pl.refreshItems();
        // if(!bool)return pl.tell("§c购买失败");
        pl.tell(`§a购买${count}！花费${totalCost}金币`);
    });
}

// 出售物品选择
/**
 * 
 * @param {Player} player 
 */
function showSellItems(player, category) {
    const form = mc.newSimpleForm()
        .setTitle(`§l§c${category.name}分类`)
        .setContent("选择要出售的物品");

    category.data.forEach(item => {
        form.addButton(`${item.name} §f(${item.data.money}金币）`, "", "");
    });
    form.addButton("§c返回", "");

    player.sendForm(form, (pl, itemId) => {
        if (itemId === null) return;
        const selectedItem = category.data[itemId];
        if (selectedItem === undefined) {
            showSellMenu(pl);
        } else {
            showSellConfirm(pl, selectedItem,1,category);
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
    var ct = player.getInventory();
    var playerItemCount = 0;
    for (var i = 0; i < ct.size; i++) {
        if (ct.getItem(i).type == itemData.data.type) {
            playerItemCount += ct.getItem(i).count;
        }
    }
    const form = mc.newCustomForm()
        .setTitle("出售确认")
        .addLabel(`§l物品信息\n名称: ${itemData.name}\n单价: ${itemData.data.money}金币\n§l当前拥有: ${playerItemCount}个`)
        .addSwitch('自动售出',false)
        .addInput("出售数量", "请输入出售数量", '', "");

    player.sendForm(form, (pl, data) => {
        if (data[2] == '') {
            if (index == 0) {
                showSellMenu(pl);
            }else if (index == 1) {
                showSellItems(pl,category);
            }
        }
        // if (data[1]) {
        //     var before = pl.getExtraData("autoSell");
        //     if (before == null) {
        //         before = {};
        //     };

        //     before[itemData.data.type] = itemData.data.money;
        //     if (nameItem.get(itemData.data.type) === null|| nameItem.get(itemData.data.type) == undefined) {
        //         nameItem.set(itemData.data.type, itemData.name);
        //     };
        //     pl.setExtraData("autoSell", before);
        // }
        const count = parseInt(data[2]);
        if (!data || count <= 0) return pl.tell("§c请输入有效数量");
        const clItem = pl.clearItem(itemData.data.type,count)
        const totalGain = itemData.data.money * clItem;

        // 修改：通过物品栏容器移除物品
        // const inventory = pl.getInventory();
        // inventory.removeItem(itemData.data.type, itemData.data.aux, count);
        
        // 增加金币
        pl.setMoney(pl.getMoney() + totalGain);

        pl.tell(`§a出售${clItem}！获得${totalGain}金币`);
    });
}

// 指令注册
mc.regPlayerCmd("shop", "打开商店", (pl) => {
    showShopMenu(pl);
}, 0); // 0表示所有玩家可执行

setInterval(() => {
    mc.getOnlinePlayers().forEach(player => {
        var data = nameItem.get(player.xuid);
        if(!!data){
            for(var type in data){
                var itemData = data[type];
                var num = player.clearItem(type, 99999);
                if(num > 0){
                    var totalGain = itemData[0] * num;
                    player.addMoney(totalGain);
                    player.tell(`§a自动售出${num}个${itemData[1]}！获得${totalGain}金币`);
                }
            }
        }
    })}, 60000); // 每分钟检查一次自动售出设置