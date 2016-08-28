var game = new Phaser.Game(575,615,Phaser.WEBGL,"");
 
game.state.add('play', {
    preload: function() {
		game.load.image('starter-background', '/src//backgrounds/Background.jpg');
        game.load.atlasJSONHash('zombie', '/src/monsters/zombie/zombie-.png', '/src/monsters/zombie/zombie-.json');
		game.load.atlasJSONHash('ZombieOuch', '/src/monsters/zombie/zombieOuch-.png', '/src/monsters/zombie/zombieOuch-.json');
		game.load.atlasJSONHash('Zombie2Ouch', '/src/monsters/zombie/zombieOuch-.png', '/src/monsters/zombie/zombieOuch-.json');
		game.load.atlasJSONHash('blockhead', '/src/monsters/blockhead/blockhead-.png', '/src/monsters/blockhead/blockhead-.json');
		game.load.atlasJSONHash('BlockheadOuch', '/src/monsters/blockhead/blockheadOuch-.png', '/src/monsters/blockhead/blockheadOuch-.json');
		game.load.image('header', '/src/assets/gui/karl-header.png');
		game.load.atlasJSONHash('gold_coin', '/src/assets/items/gold_coin.png', '/src/assets/items/gold_coin.json')
		
		this.game.load.image('dagger', 'assets/496_RPG_icons/W_Dagger002.png');
        this.game.load.image('swordIcon1', 'assets/496_RPG_icons/S_Sword15.png');
		// build panel for upgrades
        var bmd = this.game.add.bitmapData(5, 5);
        bmd.ctx.fillStyle = '#9a783d';
        bmd.ctx.strokeStyle = '#35371c';
        bmd.ctx.lineWidth = 12;
        bmd.ctx.fillRect(0, 0, 250, 500);
        bmd.ctx.strokeRect(0, 0, 250, 500);
        this.game.cache.addBitmapData('upgradePanel', bmd);

        var buttonImage = this.game.add.bitmapData(476, 48);
        buttonImage.ctx.fillStyle = '#e6dec7';
        buttonImage.ctx.strokeStyle = '#35371c';
        buttonImage.ctx.lineWidth = 4;
        buttonImage.ctx.fillRect(0, 0, 225, 48);
        buttonImage.ctx.strokeRect(0, 0, 225, 48);
        this.game.cache.addBitmapData('button', buttonImage);

        // the main player
        this.player = {
            clickDmg: 1,
            gold: 50,
            dps: 0
        };

        // world progression
        this.level = 1;
        // how many monsters have we killed during this level
        this.levelKills = 0;
        // how many monsters are required to advance a level
        this.levelKillsRequired = 10;
		

	},
    create: function() {
		var state = this;

        this.background = this.game.add.group();
        // setup each of our background layers to take the full screen
        ['starter-background', 'starter-background', 'starter-background', 'starter-background']
            .forEach(function(image) {
                var bg = state.game.add.tileSprite(0, 0, state.game.world.width,
                    state.game.world.height, image, '', state.background);
                bg.tileScale.setTo(4,5);
            });

        this.upgradePanel = this.game.add.image(20, 70, this.game.cache.getBitmapData('upgradePanel'));
        var upgradeButtons = this.upgradePanel.addChild(this.game.add.group());
        upgradeButtons.position.setTo(8, 8);

        var upgradeButtonsData = [
            {icon: 'dagger', name: 'Attack', level: 0, cost: 5, purchaseHandler: function(button, player) {
                player.clickDmg += 1;
            }},
            {icon: 'swordIcon1', name: 'Auto-Attack', level: 0, cost: 25, purchaseHandler: function(button, player) {
                player.dps += 5;
            }}
        ];
        var button;
        upgradeButtonsData.forEach(function(buttonData, index) {
            button = state.game.add.button(0, (50 * index), state.game.cache.getBitmapData('button'));
            button.icon = button.addChild(state.game.add.image(6, 6, buttonData.icon));
            button.text = button.addChild(state.game.add.text(42, 6, buttonData.name + ': ' + buttonData.level, {font: '16px Arial Black'}));
            button.details = buttonData;
            button.costText = button.addChild(state.game.add.text(42, 24, 'Cost: ' + buttonData.cost, {font: '16px Arial Black'}));
            button.events.onInputDown.add(state.onUpgradeButtonClick, state);

            upgradeButtons.addChild(button);
        });
		var bg = game.add.image(0, 0, 'starter-background');
		bg.scale.setTo(0.75, 0.75);
		
		var monsterData = [
		{name: 'Zombie', image: 'zombie', maxHealth: '30', damageImage: 'zombieOuch'},
		{name: 'Zombie2', image: 'zombie', maxHealth: '30', damageImage: 'zombieOuch'},
		{name: 'Blockhead', image: 'blockhead', maxHealth: '28', damageImage: 'blockheadOuch'}
		];

		this.monsters = this.game.add.group();
		
        var monster;
        monsterData.forEach(function(data) {
            // create a sprite for them off screen
            monster = state.monsters.create(1000, state.game.world.centerY, data.image);
			
			monster.animations.add('bounce');
			monster.animations.play('bounce', 30, true);
            // use the built in health component
            monster.health = monster.maxHealth = data.maxHealth;
            // center anchor
            monster.anchor.setTo(0.5, 1);
            // reference to the database
            monster.details = data;
            //enable input so we can click it!
            monster.inputEnabled = true;
            monster.events.onInputDown.add(state.onClickMonster, state);
			monster.events.onInputDown.add(state.onChangeMonster, state);

            // hook into health and lifecycle events
            monster.events.onKilled.add(state.onKilledMonster, state);
            monster.events.onRevived.add(state.onRevivedMonster, state);
        });

	 // display the monster front and center
        this.currentMonster = this.monsters.getRandom();
        this.currentMonster.position.set(this.game.world.centerX + 10, this.game.world.centerY + 50);

        this.monsterInfoUI = this.game.add.group();
        this.monsterInfoUI.position.setTo(this.currentMonster.x - 100, this.currentMonster.y + 120);
        this.monsterNameText = this.monsterInfoUI.addChild(this.game.add.text(0, 0, this.currentMonster.details.name, {
            font: '48px Arial Black',
            fill: '#fff',
            strokeThickness: 4
        }));
        this.monsterHealthText = this.monsterInfoUI.addChild(this.game.add.text(0, -30, this.currentMonster.health + ' HP', {
            font: '32px Arial Black',
            fill: '#ff0000',
            strokeThickness: 4
        }));

        this.dmgTextPool = this.add.group();
        var dmgText;
        for (var d=0; d<50; d++) {
            dmgText = this.add.text(0, 0, '1', {
                font: '64px Arial Black',
                fill: '#fff',
                strokeThickness: 4
            });
            // start out not existing, so we don't draw it yet
            dmgText.exists = false;
            dmgText.tween = game.add.tween(dmgText)
                .to({
                    alpha: 0,
                    y: 100,
                    x: this.game.rnd.integerInRange(100, 700)
                }, 1000, Phaser.Easing.Cubic.Out);

            dmgText.tween.onComplete.add(function(text, tween) {
                text.kill();
            });
            this.dmgTextPool.add(dmgText);
        }

        // create a pool of gold coins
        coins = game.add.group();
        coins.createMultiple(50, 'gold_coin', '', false);
		coins.scale.set(0.2, 0.2);
		coins.callAll('animations.add', 'animations', 'spin', [0, 1, 2, 3, 4, 5,], 15, true);
		coins.callAll('animations.play', 'animations', 'spin');
        coins.setAll('inputEnabled', true);
        coins.setAll('goldValue', 1);
        coins.callAll('events.onInputDown.add', 'events.onInputDown', this.onClickCoin, this);

        this.playerGoldText = this.add.text(30, 30, 'Gold: ' + this.player.gold, {
            font: '24px Arial Black',
            fill: '#fff',
            strokeThickness: 4
        });

        // 100ms 10x a second
        this.dpsTimer = this.game.time.events.loop(100, this.onDPS, this);

        // setup the world progression display
        var header = this.game.add.sprite(this.game.world.centerX + 190, this.game.world.centerY - 165, 'header');
		header.anchor.setTo(0.5, 1);
		this.levelUI = this.game.add.group();
        this.levelUI.position.setTo(this.game.world.centerX + 190, this.game.world.centerY - 225);
        this.levelText = this.levelUI.addChild(this.game.add.text(-65, -30, 'Level: ' + this.level, {
            font: '24px Arial Black',
            fill: '#fff',
            strokeThickness: 4
        }));
        this.levelKillsText = this.levelUI.addChild(this.game.add.text(-65, 10, 'Kills: ' + this.levelKills + '/' + this.levelKillsRequired, {
            font: '24px Arial Black',
            fill: '#fff',
            strokeThickness: 4
        }));
		//var style = {font: "23px 'Arial Black'", fill: "#fff", wordWrap: true,  strokeThickness: 4, wordWrapWidth: header.width, align: "center"};
		//leveltext = this.game.add.text(this.game.world.centerX + 190, this.game.world.centerY - 195, 'Level: ' + this.level, style);
		//killstext = this.game.add.text(this.game.world.centerX + 190, this.game.world.centerY - 225, 'Kills: ' + this.levelKills + '/' + this.levelKillsRequired, style);
		//leveltext.anchor.set(0.5, 1);
		//killstext.anchor.set(0.5, 1);
    },
    onDPS: function() {
        if (this.player.dps > 0) {
            if (this.currentMonster && this.currentMonster.alive) {
                var dmg = this.player.dps / 10;
                this.currentMonster.damage(dmg);
                // update the health text
                this.monsterHealthText.text = this.currentMonster.alive ? Math.round(this.currentMonster.health) + ' HP' : 'DEAD';
            }
        }
    },
    onUpgradeButtonClick: function(button, pointer) {
        // make this a function so that it updates after we buy
        function getAdjustedCost() {
            return Math.ceil(button.details.cost + (button.details.level * 1.46));
        }

        if (this.player.gold - getAdjustedCost() >= 0) {
            this.player.gold -= getAdjustedCost();
            this.playerGoldText.text = 'Gold: ' + this.player.gold;
            button.details.level++;
            button.text.text = button.details.name + ': ' + button.details.level;
            button.costText.text = 'Cost: ' + getAdjustedCost();
            button.details.purchaseHandler.call(this, button, this.player);
        }
    },
    onClickCoin: function(coin) {
        if (!coin.alive) {
            return;
        }
        // give the player gold
        this.player.gold += coin.goldValue;
        // update UI
        this.playerGoldText.text = 'Gold: ' + this.player.gold;
        // remove the coin
        coin.kill();
    },
    onKilledMonster: function(monster) {
        // move the monster off screen again
        monster.position.set(1000, this.game.world.centerY);

        var coin;
        // spawn a coin on the ground
        coin = coins.getFirstExists(false);
        coin.reset(this.game.world.centerX + this.game.rnd.integerInRange(-100, 100), this.game.world.centerY);
        coin.goldValue = Math.round(this.level * 1.33);
        this.game.time.events.add(Phaser.Timer.SECOND * 3, this.onClickCoin, this, coin);

        this.levelKills++;

        if (this.levelKills >= this.levelKillsRequired) {
            this.level++;
            this.levelKills = 0;
        }
		this.levelText.text = 'Level: ' + this.level;
		this.levelKillsText.text = 'Kills: ' + this.levelKills + '/' + this.levelKillsRequired;
		function miniRender(){

		}
        // pick a new monster
        this.currentMonster = this.monsters.getRandom();
        // upgrade the monster based on level
        this.currentMonster.maxHealth = Math.ceil((parseInt(this.currentMonster.details.maxHealth)) + ((this.level - 1) * 10.6));
        // make sure they are fully healed
        this.currentMonster.revive(this.currentMonster.maxHealth);
    },
    onRevivedMonster: function(monster) {
        monster.position.set(this.game.world.centerX + 11, this.game.world.centerY + 50);
        // update the text display
        this.monsterNameText.text = monster.details.name;
        this.monsterHealthText.text = monster.health + 'HP';
    },
    onClickMonster: function(monster, pointer) {
        // apply click damage to monster
        this.currentMonster.damage(this.player.clickDmg);
		var textureName = this.monsterNameText.text+'Ouch';
		function invsibile(){
			monster.visible = 0;
		};
		function visibile(){
			setTimeout(
			function(){
				monster.visible = 1, ouch.kill();
			},
			109
			);
		};
		invsibile();
		visibile();
		var ouch = this.game.add.sprite(this.game.world.centerX + 10, this.game.world.centerY + 50, textureName);
		ouch.anchor.setTo(0.5, 1);
		ouch.animations.add('ouch');
		ouch.animations.play('ouch', 40, false, true);
		
        // grab a damage text from the pool to display what happened
        var dmgText = this.dmgTextPool.getFirstExists(false);
        if (dmgText) {
            dmgText.text = this.player.clickDmg;
            dmgText.reset(pointer.positionDown.x, pointer.positionDown.y);
            dmgText.alpha = 1;
            dmgText.tween.start();
        }
        // update the health text
        this.monsterHealthText.text = this.currentMonster.alive ? this.currentMonster.health + ' HP' : 'DEAD';
    },
	onChangeMonster: function(){
		
	},
	onRevertMonster: function(){
	},
    render: function() {
		
	},
});
 
game.state.start('play');
