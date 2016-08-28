var game = new Phaser.Game("100%","100%",Phaser.CANVAS,"");
 
game.state.add('play', {
    preload: function() {
		game.load.image('starter-background', '/src//backgrounds/Background.jpg');
        game.load.atlasJSONHash('zombie', '/src/monsters/zombie/zombie-.png', '/src/monsters/zombie/zombie-.json');
		
	},
    create: function() {
		var bg = game.add.image(0, 0, 'starter-background');
		bg.scale.setTo(0.75, 0.75);
		
		function MonsterVar (type){
			this.name = type;
			this.image = "image";
			this.maxHealth = "maxHealth";
			this.currentHealth = "currentHealth";
			this.goldValue = "goldValue";
			this.expValue = "expValue";
			this.isBoss = "0";
			this.isChest = "0";
		};
		
		var monsterData = [
		{name: 'Zombie', image: 'zombie', maxHealth: '30'},
		{name: 'Zombie2', image: 'zombie', maxHealth: '30'}
		];
		
		//var zombie = game.add.sprite(205, 205, 'zombie');
		//var bounce = zombie.animations.add('bounce');
		//zombie.animations.play('bounce', 40, true);
		
		var arrayLength = monsterData.length;
		var monsterExists = 0;
		
		function NewMonster(){
			var newMonster = monsterData[Math.floor(Math.random()*monsterData.length)];
			var pos = monsterData.indexOf(newMonster);
			monster_name = monsterData[pos].name;
			monster_image = monsterData[pos].image;
			monster_maxHealth = monsterData[pos].maxHealth;
			monster_currentHealth = monsterData[pos].maxHealth;
			var newMonsterSprite = game.add.sprite(this.game.world.centerX + 70, this.game.world.centerY + 60, newMonster.image);
			newMonsterSprite.anchor.setTo(0.5, 0.5);
			newMonsterSprite.scale.setTo(1, 1);
			var bounce = newMonsterSprite.animations.add('bounce');
			newMonsterSprite.animations.play('bounce', 30, true);
			var monsterExists = 1;
			//enable input so we can click it!
			NewMonster.inputEnabled = true;
			NewMonster.events.onInputDown.add(state.onClickMonster, state);
			
		};
		if (monsterExists == 0){
			NewMonster();
		};
		
    },
    render: function() {
			var currentMonsterName = game.add.text(this.game.world.centerX + 30, this.game.world.centerY - 215, monster_name);
			var currentHealthText = game.add.text(this.game.world.centerX + 20, this.game.world.centerY  - 185, monster_currentHealth);
			var slashText = game.add.text(this.game.world.centerX + 55, this.game.world.centerY - 185, '/');
			var maxHealth = game.add.text(this.game.world.centerX + 76, this.game.world.centerY - 185, monster_maxHealth);
			maxHealth.anchor.setTo(0.5, 0.5);
			slashText.anchor.setTo(0.5, 0.5);
			currentHealthText.anchor.setTo(0.5, 0.5);
			currentMonsterName.anchor.setTo(0.5, 0.5);
    }
});
 
game.state.start('play');