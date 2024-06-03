if (window.hasInitialized) {
    console.log("Initialization skipped because it's already done.");
} else {
    document.addEventListener('DOMContentLoaded', function() {
        setupInputListeners();
        setupEventListeners();
        initializeHPBar();
        initializeAbilitiesTable();
        initializeAilments();
        updateSpellsTable();
    });

    window.hasInitialized = true;
}

function setupInputListeners() {
    const vitInput = document.getElementById('vit');
    const fitInput = document.getElementById('fit');
    const raceSelect = document.getElementById('race');

    if (vitInput) {
        vitInput.addEventListener('input', function() {
            calculateMaxHP();
            updateHPBar(document.getElementById('hp').value, document.getElementById('maxHP').value);
        });
    } else {
        console.error('Vitality input not found.');
    }

    if (fitInput) {
        fitInput.addEventListener('input', function() {
            calculateStamina();
            calculateMovement();
        });
    }

    // Assuming the 'hp' input is also important
    const hpInput = document.getElementById('hp');
    if (hpInput) {
        hpInput.addEventListener('input', function() {
            updateHPBar(hpInput.value, document.getElementById('maxHP').value);
        });
    }

    if (raceSelect) {
        raceSelect.addEventListener('change', calculateMovement);
    }

}

function setupEventListeners() {
    const raceInfoBtn = document.getElementById('raceInfoBtn');
    if (raceInfoBtn) {
        raceInfoBtn.addEventListener('click', openRaceInfo);
    }

    const newRound = document.querySelector('button that triggers new round');
    if (newRound) {
        newRound.addEventListener('click', newRound);
    } /*else {
        console.error('New Round button not found!');
    }*/

    const importFile = document.getElementById('importFile');
    if (importFile) {
        importFile.addEventListener('change', loadFormData);
    }

    const addWeaponButton = document.getElementById('addWeaponButton');
    if (addWeaponButton) {
        addWeaponButton.addEventListener('click', function() {
            addWeapon(); // Call the function directly
        });
    } /*else {
        console.error('Add Weapon button not found!');
    }*/

    const loadButton = document.getElementById('loadButton');
    if (loadButton) {
        loadButton.addEventListener('click', function() {
            document.getElementById('fileInput').click(); // Directly trigger file input
        });
    } else {
        console.error('Load button not found!');
    }

    const firstTabWithContent = document.querySelector('.tabcontent:not(:empty)');
    if (firstTabWithContent) {
        let type = firstTabWithContent.id;
        openTab(new Event('click'), type); // Manually trigger tab open
        document.querySelector(`[onclick="openTab(event, '${type}')"]`).classList.add('active');
    }

    // Listener for stamina input changes
    const staminaInput = document.getElementById('stamina');
    staminaInput.addEventListener('input', () => {
        const currentStamina = parseInt(staminaInput.value, 10);
        const maxStamina = parseInt(staminaInput.max, 10);
        updateStaminaBar(currentStamina, maxStamina);
    });

    // Listener for new round button
    const newRoundButton = document.getElementById('newRoundButton'); // Assuming the button has this ID
    newRoundButton.addEventListener('click', () => {
        const currentStamina = parseInt(staminaInput.value, 10);
        const maxStamina = parseInt(staminaInput.max, 10);
        updateStaminaBar(currentStamina, maxStamina);
        // Include any additional logic needed for a new round
    });

    // Make sure to update stamina on page load or when data is loaded
    document.addEventListener('DOMContentLoaded', () => {
        const currentStamina = parseInt(staminaInput.value, 10) || 10; // Default to 10 if nothing is set
        const maxStamina = staminaInput.max || 15; // Adjust according to your "Marathoner" trait logic
        updateStaminaBar(currentStamina, maxStamina);
    });

}

document.querySelectorAll('.tooltip').forEach(function (tooltip) {
    tooltip.addEventListener('mouseenter', function () {
        const tooltipText = tooltip.querySelector('.tooltiptext');
        // Adjust tooltip based on content length
        if (tooltipText.textContent.length > 80) { // Adjust the threshold as needed
            tooltipText.style.textAlign = 'left';
            tooltipText.style.whiteSpace = 'normal';
        } else {
            tooltipText.style.textAlign = 'center';
            tooltipText.style.whiteSpace = 'nowrap';
        }

        // Check if the tooltip goes out of bounds
        const rect = tooltipText.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            tooltipText.style.left = 'auto';
            tooltipText.style.right = '0';
            tooltipText.style.transform = 'translateX(0%)';
        }
        tooltipText.style.visibility = 'visible';
        tooltipText.style.opacity = 1;
    });

    tooltip.addEventListener('mouseleave', function () {
        const tooltipText = tooltip.querySelector('.tooltiptext');
        tooltipText.style.visibility = 'hidden';
        tooltipText.style.opacity = 0;
    });
});

function initializeHPBar() {
    const vitInput = document.getElementById('vit');
    const hpInput = document.getElementById('hp');
    // Ensure values are recalculated and the bar is updated on page load
    if (vitInput && hpInput) {
        calculateMaxHP(); // This will set maxHP based on the current vitality
        updateHPBar(hpInput.value, document.getElementById('maxHP').value);
    }
}

function getColorForPercentage(pct) {
    if (pct > 0.9) {
        return '#00AAFF'; // Blue color for overshield
    } else if (pct > 0.8) {
        return '#00D4FF';
    } else if (pct > 0.7) {
        return '#00FFD4';
    } else if (pct > 0.6) {
        return '#00FF80'; 
    } else if (pct > 0.5) {
        return '#00FF2B'; 
    } else if (pct > 0.4) {
        return '#2AFF00'; 
    } else if (pct > 0.3) {
        return '#AAFF00'; 
    } else if (pct > 0.2) {
        return '#FFFF00'; 
    } else if (pct > 0.1) {
        return '#FFAA00'; 
    } else if (pct > 0) {
        return '#FF5500';
    } else {
        return '#FF0000'; // Red for 0% or below
    }
}

function updateHPBar(currentHP, maxHP) {
    const hpText = document.getElementById('hpText');
    const percentage = Math.min(currentHP / maxHP, 1); // Ensures the percentage doesn't exceed 100%
    const displayPercentage = (percentage * 100).toFixed(0); // Format percentage for display
    const circumference = 100; // The circumference of the circle
    const offset = circumference * (1 - percentage); // Calculate the offset based on current health

    const circle = document.querySelector('.circle');
    circle.style.strokeDasharray = `${circumference}, ${circumference}`;
    circle.style.strokeDashoffset = offset;
    circle.style.stroke = getColorForPercentage(percentage); // Update the color based on health

    // Update text to include both absolute HP and percentage
    hpText.innerHTML = `<span class="hp-percentage">(${displayPercentage}%)</span>HP: ${currentHP} / ${maxHP}`;
}

function updateStaminaBar(currentStamina, maxStamina) {
    const staminaText = document.getElementById('staminaText');
    const percentage = Math.min(currentStamina / maxStamina, 1);
    const circumference = 100;
    const offset = circumference * (1 - percentage);

    const circle = document.querySelector('#staminaCircleContainer .circle');
    circle.style.strokeDasharray = `${circumference}, ${circumference}`;
    circle.style.strokeDashoffset = offset;
    circle.style.stroke = getColorForPercentage(percentage); // Ensure this function handles stamina colors if different

    staminaText.textContent = `Stamina: ${currentStamina} / ${maxStamina}`;
}

// Attach this function to relevant event listeners like changes in stamina or "New Round" button clicks.

function openRaceInfo() {
    var race = document.getElementById('race').value;
    var urlMap = {
        'Human': 'https://www.worldanvil.com/w/the-bestiarium-viktor-daik/a/human-article',
        'Volar': 'https://www.worldanvil.com/w/the-bestiarium-viktor-daik/a/volar-article',
        'Felis': 'https://www.worldanvil.com/w/the-bestiarium-viktor-daik/a/felis-species',
        'Other': ''
    };

    var url = urlMap[race] || '';
    if (url === '') {
        alert('Please specify the race in the notes.');
        return;
    }
    window.open(url, '_blank');
}

function calculateMaxHP() {
    const vitInput = document.getElementById('vit');
    if (vitInput) {
        const vit = parseInt(vitInput.value, 10) || 0;
        const maxHP = 5 * vit + 50;
        document.getElementById('maxHP').value = maxHP;
      //  console.log('Calculated Max HP:', maxHP);
    }
}

function calculateStamina() {
    var fit = parseInt(document.getElementById('fit').value) || 0;
    var sta = Math.round(fit / 4);
    document.getElementById('sta').value = sta;
}

function calculateMovement() {
    var fit = parseInt(document.getElementById('fit').value) || 0;
    var race = document.getElementById('race').value;
    var movBase = race === "Volar" ? 10 : 7;
    var mov = Math.round(fit / 3 + movBase);
    document.getElementById('mov').value = mov;
}

function previewImage() {
    var file = document.getElementById('characterImage').files[0];
    var reader = new FileReader();
    reader.onload = function (e) {
        var imgElement = document.getElementById('displayImage');
        imgElement.src = e.target.result;
        imgElement.style.display = 'block'; // Show the image
        var container = document.getElementById('imageContainer');
        container.style.border = 'none'; // Remove the border
        document.getElementById('imagePlaceholder').style.display = 'none'; // Hide placeholder
    };
    if (file) {
        reader.readAsDataURL(file);
    } else {
        document.getElementById('displayImage').style.display = 'none';
        document.getElementById('imagePlaceholder').style.display = 'flex'; // Show placeholder if no image
        document.getElementById('imageContainer').style.border = '2px dashed #ccc'; // Restore border if no image
    }
}

function openTraitInfo(traitId) {
    var trait = document.getElementById(traitId).value;
    var url = "";
    switch (trait) {
        case 'brave':
            url = 'https://www.example.com/brave';
            break;
        case 'wise':
            url = 'https://www.example.com/wise';
            break;
        case 'charismatic':
            url = 'https://www.example.com/charismatic';
            break;
        // Add more cases for other traits
        case 'impulsive':
            url = 'https://www.example.com/impulsive';
            break;
        case 'naive':
            url = 'https://www.example.com/naive';
            break;
        case 'stubborn':
            url = 'https://www.example.com/stubborn';
            break;
        // Add more cases for other traits
    }
    if (url) {
        window.open(url, '_blank'); // Opens the linked article in a new tab
    }
}

function initializeAbilitiesTable() {
    const tableBody = document.getElementById('abilities-section').querySelector('tbody');
    const maxLevel = 20; // Maximum level to generate rows for
    const weaponAbilities = [
        { name: "Quickshot (Ranged)", description: "Disregarding the order of combatants the character can do a ranged attack at the start of each round. This action still requires stamina." },
        { name: "Warning Shot (Ranged)", description: "The character can shoot a projectile that doesn’t hit any combatant or bystander. The intimidation attempts towards any witnesses get a +3 bonus." },
        { name: "Well Aimed (Ranged)", description: "If the character did not get hit by either damage or other effects in the previous turn, their attack can not be blocked (but still dodged)." },
        { name: "Multishot (Ranged)", description: "You can choose to shoot more than one projectile at once at the same enemy, not spending extra stamina on the extra attack. However, in doing so you get a -4 penalty per extra shot should the enemy try to block or dodge per extra projectile." },
        { name: "Parabel Shot (Ranged)", description: "Doubles the range of your bow or crossbow attacks." },
        { name: "Take Cover (Ranged)", description: "If you have not been attacked this round your character may hide behind any object larger than them. They will not be targeted for attacks next round as long as another party member is still fighting." },
        { name: "Wild Archery (Ranged)", description: "Allows you to do ranged attacks while moving, running, jumping, falling and shooting around corners over a distance of 5m without penalty. You get an additional 3m movement in your turn." },
        { name: "Piercing Shot (Ranged)", description: "You can use 2 stamina to ignore the DEF value of a target for this turn. This attack still has normal damage calculation." },
        { name: "Disrupting Shot (Ranged)", description: "You can use 2 stamina to ignore the MDEF value of a target for this turn. This attack still has normal damage calculation." },
        { name: "Whistling Shot (Ranged)", description: "Fires an arrow that emits a high pitched noise during flight. This attack still has normal damage calculation. Regardless of hit or miss disrupts a target's concentration, making it unable to cast magic in the next round (only works on targets with a sense for sound)." },
        { name: "Head Shot (Ranged)", description: "If you have not attacked or moved this turn you can use 5 stamina to land a perfect headshot. Roll for max damage with critical hit multiplier. (Attack can still be attempted to be dodged, the target gets a -3 penalty on the attempt). You can not move or attack after this attack." },
        { name: "Hot Shot (Ranged)", description: "When using ranged attacks on targets with no DEF, always roll for max damage if the attack isn’t blocked or dodged." },
        { name: "Argus (Ranged)", description: "The character does not miss perception checks anymore unless they roll a 1." },
        { name: "Sagittarius (Ranged)", description: "The character does not get penalties for environmental or distance related difficulty in aiming, excluding darkness. I.e. if the character wields a bow with a range of 120m, they can hit anything within those 120m as long as the arrow can reach it unhindered and as long as the character knows the position of the target." },
        { name: "Starshot (Ranged)", description: "When successfully dodging an attack the character can shoot the attacker immediately without additional stamina consumption. The attacker is allowed to dodge the counterattack but not block it. If the attack hits it automatically counts as a critical hit (other critical hit requirements also apply)." },
        { name: "Eagle Eye (Ranged)", description: "Even if the target does not block or dodge, you may still roll a D20 against the GM to meet the criteria for a critical hit. All other results will be ignored and the attack is calculated as usual." },
        { name: "Blinding Shot (Ranged)", description: "The character can shoot an arrow that releases a bright flash on impact (requires 1 light essence), temporarily blinding the target (target is blinded for one round and has a -3 penalty to all actions)." },
        { name: "Precision Focus (Ranged)", description: "Once per battle, the character can focus intensely, granting a +5 bonus to their next ranged attack roll." },
        { name: "Ricochet Shot (Ranged)", description: "Only Rifles: The character can spend 3 stamina to aim very precisely and shoot a projectile that bounces off surfaces, hitting multiple targets within a 5m radius of the primary target for the same damage." },
        { name: "Sharp Edge (Bladed)", description: "Deal 2, 4 or 8 damage more (depending on light, medium or heavy weapon used) to an enemies health per attack. (deal regular damage to DEF and MDEF)" },
        { name: "Beat Attack (Bladed)", description: "Deal an extra 6 damage when successfully breaking through an opponent's block attempt." },
        { name: "Riposte (Bladed)", description: "After a successful block you may counter attack your opponent. This action still consumes stamina." },
        { name: "Point-in-line (Bladed)", description: "When successfully blocking an opponent's attack while rolling a 16 or higher you can immediately counter attack without additional stamina cost." },
        { name: "Feint (Bladed)", description: "Get a +2 Bonus on your roll when your target is trying to block your attack. Cannot be used with heavy weapons." },
        { name: "Zornhau (Bladed)", description: "When your target fails a block attempt and you roll a 16 or higher, deal an additional D6 damage." },
        { name: "Durchwechseln (Bladed)", description: "You may disengage an opponent after blocking or being blocked without penalty." },
        { name: "Mutating (Bladed)", description: "When your opponent successfully blocks your attack and you attack him again this turn your following attack gets a +2 bonus for each of the following attempts." },
        { name: "Professional Footwork (Bladed)", description: "Allows you to move around, behind or through an opponent without using up your movement." },
        { name: "Slicing (Bladed)", description: "When landing a critical hit on an opponent with less than 10 DEF you can slice through an opponent’s limb or neck of your choice." },
        { name: "Eisenport (Bladed)", description: "You have extensive knowledge on parrying and blocking. You get a +2 modifier on all block attempts from either your character or his opponent." },
        { name: "The Slap (Bladed)", description: "After successfully blocking an opponent in close range while they rolled a 10 or lower on their attack, you can choose to have your character slap them in their face. Once slapped neither you nor the opponent can disengage by any means without receiving a max damage critical attack that costs no stamina. Other enemies will not engage you until either you or the slapped opponent are dead or disengaged. Otherwise lawless, honorless people and even mindless beasts and creatures will gain an innate sense of honor and follow the rules of the slap upon witnessing it." },
        { name: "Blessed Parry (Bladed)", description: "Once per engagement in combat, when you fail a block attempt you can immediately reroll. Your opponent cannot reroll while you use “Blessed Parry”." },
        { name: "Reckless Abandon (Bladed)", description: "After running out of stamina you can still attack this turn. You take 10 points of damage for each point of stamina you would need for these attacks. You cannot block or dodge for the rest of this and the next round." },
        { name: "Disarming Strike (Bladed)", description: "The character can spend 2 stamina to perform a precise attack that attempts to disarm the opponent, causing them to drop their weapon on a failed block attempt." },
        { name: "Blade Dance (Bladed)", description: "Once per battle, the character can enter a heightened state of focus, granting a +3 bonus to their attack rolls and making them immune to being Vulnerable, stunned or knocked unconscious for one round." },
        { name: "Counterstrike (Bladed)", description: "After a successful block, the character can immediately retaliate with a free attack with a +4 bonus to damage." },
        { name: "Flowing Stance (Bladed)", description: "The character gains a +2 bonus to DEF for the remainder of the round after successfully landing an attack." },
        { name: "Murderous Frenzy (Bladed)", description: "The character gains 3 stamina after killing an enemy with a heavy attack." },
        { name: "Slam (Dull)", description: "When attacking with a dull weapon your opponent has a -1 penalty on their block attempts" },
        { name: "Crack (Dull)", description: "You can spend 1 additional stamina to ignore the target's DEF for the remainder of your turn." },
        { name: "Disorient (Dull)", description: "You can spend 1 additional stamina after your successful attack to stop a target from casting a spell for the remainder of the round." },
        { name: "Heavy Hit (Dull)", description: "You attack with a dull weapon as hard as you can. The attack costs 2 stamina and is regarded as an attack with a heavy weapon. Use the full VIT value of your character for the damage calculation and add +1D6 damage when using a light weapon or +1D12 damage for medium weapons." },
        { name: "Shield Breaker (Dull)", description: "When using a heavy dull weapon you break or knock away shields when opponents try to block you, making them either unusable for the rest of the combat or the rest of the round (Depending on the shields type and material the GM decides what happens)." },
        { name: "Bonk (Dull)", description: "Use 1 additional stamina point to try to stun your opponent with a well aimed hit (apply normal damage calculation). When blocking or dodging this attack your opponent gains a +2 bonus. (Stunned: The afflicted skips their next turn)." },
        { name: "Break Apart (Dull)", description: "After breaking through the DEF of an enemy (by dealing more damage than the DEF value) your party members can ignore the DEF of that enemy for the rest of this round." },
        { name: "Knock Away (Dull)", description: "When landing an unblocked hit with a heavy dull weapon you can choose to disengage the enemy without penalty." },
        { name: "Bring it on (Dull)", description: "You let out a mighty roar to provoke any number of combatants to attack you. This does not benefit you, but draws the attention away from your party members. Already engaged enemies will not disengage upon being provoked this way." },
        { name: "Shatter (Dull)", description: "You can execute an extremely heavy attack for 4 stamina that is unblockable but has a -4 penalty if your opponent dodges. After the attack hits, your opponent loses all DEF for the rest of the battle. (Uses characters VIT value as additional damage)" },
        { name: "Heavy Combo (Dull)", description: "The character executes 4 consecutive heavy hits on the same target for 5 Stamina. Use the full VIT value of your character for the damage calculation and add +1D6 damage when using a light weapon or +1D12 damage for medium weapons." },
        { name: "Roundabout (Dull)", description: "Hits all combatants around you with a heavy attack that costs 3 stamina. Use the full VIT value of your character for the damage calculation and add +1D6 damage when using a light weapon or +1D12 damage for medium weapons." },
        { name: "Annihilator (Dull)", description: "You can execute an extremely heavy attack for 6 stamina that is unblockable but has a -3 penalty if your opponent dodges. After the attack hits, your opponent loses all DEF and MDEF for the rest of the battle. (Uses characters VIT value as additional damage)" },
        { name: "Hair’s Breadth (Dull)", description: "When dodging an attack with a difference to your opponent's roll of 2 or less you counter with a critical hit from your weapon. This counterattack can neither be blocked nor dodged and does not consume stamina." },
        { name: "Ignorant (Dull)", description: "Attacks with dull weapons from your character ignore DEF." },
        { name: "Suckerpunch (Fist Fighting)", description: "When an opponent attacks you can punch them instead of blocking, dealing damage equal to your unarmed strike. This does not work on opponents with more than 10 DEF and you will get hit instead." },
        { name: "Chokehold (Fist Fighting)", description: "After a successful dodge you can take your opponent into a chokehold making them unable to attack or cast spells and dealing 1D6 of damage for every turn they are in that hold. This action does not consume your stamina. Opponents can use 1 stamina to roll a D20 against you to get out of the chokehold when they roll higher. If an opponent is still in your chokehold after reaching 0 stamina they will be rendered unconscious. (unconscious: The afflicted is unable to act for 5 rounds)" },
        { name: "Stone Fist (Fist Fighting)", description: "Your unarmed strikes now deal 1D4 damage +¼ VIT damage" },
        { name: "Overthrow (Fist Fighting)", description: "After a successful dodge you can throw the opponent over your shoulder (within reasonable limits regarding weight and size) to stun them and deal 1D12 damage. (Stunned: The afflicted skips their next turn)" },
        { name: "Iron Fist (Fist Fighting)", description: "Your unarmed strikes now deal 1D6 + ½ VIT damage" },
        { name: "Uppercut (Fist Fighting)", description: "You can stun your opponent by striking their jaw. This attack gets a +2 bonus when your opponent is trying to dodge or block. Deals damage equal to your unarmed strike. (Stunned: The afflicted skips their next turn)" },
        { name: "Unarmed Martial Artist (Fist Fighting)", description: "You can attack thrice per stamina point used as long as you remain unarmed and have 5 DEF or less and carry less than 10kg." },
        { name: "Duck and Weave (Fist Fighting)", description: "Dodging only costs 1 stamina when unarmed." },
        { name: "Untouchable (Fist Fighting)", description: "Dodging gives you a bonus of +3 on your dice roll." },
        { name: "Fist of a God (Fist Fighting)", description: "Your unarmed strikes deal 1D12+ ½ VIT damage." }        
    ];
    const additionalAbilities = [
        { name: "Poison Drinker", description: "(Requires: Poison Resistance) The character heals the damage he would get when being poisoned. If at full health already, the character will instead increase their physical attack damage by 10% for the remainder of the fight and remove all stacks of poison. This buff cannot be stacked." },
        { name: "Cold Resistance", description: "The character does not suffer negative effects from being in a cold environment." },
        { name: "Boreal Warrior", description: "(Requires: Cold Resistance) The character gets +1 stamina regeneration in cold environments." },
        { name: "Heat Resistance", description: "The character does not suffer the negative effects of hot climates." },
        { name: "Tropical Hunter", description: "(Requires: Heat Resistance) When in hot climates your attacks deal an extra D6 damage per stamina point spent." },
        { name: "Unphased", description: "You can no longer be stunned from non damaging attacks or spells." },
        { name: "Unbothered", description: "(Requires: Unphased) You can no longer be stunned." },
        { name: "Unyielding", description: "(Requires: Unbothered) You can no longer be toppled or knocked unconscious. Your stamina regeneration can never fall below 1." },
        { name: "Bleed Resistance", description: "Bleeding stacks only deal half damage. (Bleeding: The afflicted takes damage equal to the number of bleeding stacks they have)" },
        { name: "Sanguineous", description: "(Requires: Bleed Resistance) Bleeding stacks on the character can not exceed 5 stacks at any time. This ability ignores other abilities that would contradict it." },
        { name: "Sand Walker", description: "Your movement is no longer limited to 5m per turn from walking on sand." },
        { name: "Mud Walker", description: "Your movement is no longer limited to 5m per turn from walking in mud." },
        { name: "All Terrain Runner", description: "(Requires either Sand Walker or Mud Walker): When traversing difficult terrain like mud, uneven ground, rocky terrain, deep sand, etc.: The character gains additional 3m movement per round." },
        { name: "Crawling Survivor", description: "The character can free themselves from sinking in quicksand or bog by laying flat on their back, pulling their legs out one at a time and crawling out (movement up to 3m). This action takes up the entire turn." },
        { name: "Storm Proof", description: "The Character no longer gets any penalty from fighting in rain storms or thunderstorms." },
        { name: "Cosmic Weather Expert", description: "The Character no longer suffers the adverse effects of a cosmic storm (Trait not recommended unless you’re sure the adventure will lead to the starfallfields as cosmic storms only occur there.)" },
        { name: "Unassuming", description: "The character is not targeted by enemies during combat, as long as other party members are fighting and they themselves have not interacted with another combatant yet." },
        { name: "Camouflage", description: "The character can spend their turn to blend into their surroundings, making it more challenging for enemies to spot them. As long as the character is not engaged and other party members are still fighting, the character will not be targeted by enemies. The first attack of the character after camouflaging will be a critical hit. (Does not work if there is nothing to camouflage your character with.)" },
        { name: "Revolting Performance", description: "Spend half the characters Stamina (min. 1) Forces an enemy to disengage the user." },
        { name: "Thrilling Entrance", description: "For the first action in combat the character can expend 1 of each essence (wind, fire, water, ice, earth) to cast a non-damaging, bright spell to make a melodramatic entrance. If the combat starts with this action or if the character has not been noticed by enemies yet, all enemies are now vulnerable for the rest of the first round." },
        { name: "Dramatic Explosion", description: "(Requires Thrilling Entrance) For the first action in combat the character can expend 1 of every essence (force, wind, fire, water, ice, earth, metal, life, lightning, cosmic) to cast a bright, flashy explosion within their line of sight and teleport to the center of the explosion. If the combat starts with this action or if the character has not been noticed by enemies yet all enemies are now stunned for the remainder of the first round and vulnerable for the next three rounds." },
        { name: "Lunge", description: "Increase your movement by 2m when attacking an opponent. You can spend 1 additional stamina points to lunge at a different opponent without any penalty." },
        { name: "Rush", description: "(Requires: Lunge) The character can act as the leader of the charge and increase the movement speed of all party members up to their own speed and allow them to disengage all enemies without penalty, in order to attack a single target. The character has to pass a leadership check in order to do so." },
        { name: "Provoking", description: "Enemies attacking this character will not attack other party members unless this character is healed or buffed by others or a party member deals damage equal to or more than 50% of the enemies max health." },
        { name: "Attention Anchor", description: "(Requires Provoking): The character takes 10% extra damage from any attack against them. Enemies will no longer attack other partymembers if the character provokes them." },
        { name: "Aggressive Tanking", description: "(Requires: Provoking) Should an enemy disengage close combat with the character, the user can spend X Stamina to punish the disengaging enemy and deal X * 20% of the users Max HP physical damage to the target." },
        { name: "Premonition", description: "Twice per battle the character can see the intentions of their target. The game master (or other player if they are the target of the premonition) has to truthfully answer what the enemy plans to do during their turn. (Certain few enemies are immune to this effect!)" },
        { name: "Foresight", description: "(Requires: Premonition) Twice per battle if the character used a premonition on an enemy and that enemy plans to attack: The character can use 1 stamina to interrupt the enemies action and the enemy is stunned for their turn instead." },
        { name: "Stargazer", description: "As long as the stars are clearly visible the character has an excellent sense of orientation boosting it by 4 points under these conditions." },
        { name: "Pent up Aggressions", description: "When not attacking or casting spells during a turn, while also receiving damage, the user starts their next turn with 1 additional point of stamina for every attacker that dealt damage to them. (passive damage from terrain effects or similar sources does not count)" },
        { name: "Pent up Rage", description: "(requires: Pent up Aggression and Draconic Punishment) Changes the effect of Draconic Punishment to: In any round in which the user has not attacked yet: all combatants in a 10m radius get damage equal to all damage dealt to the character. Enemies that die within 10m of the character can not be revived." },
        { name: "Death Defiance", description: "The character can survive a mortal blow with 1HP once per battle" },
        { name: "Draconic Punishment", description: "Every time the character with this trait is damaged, except through this ability or by self inflicted injury, all combatants in a 10m radius take 1D8 unmitigated damage. This is not optional! Enemies that die in a 10m radius around the character wielding this ability cannot be revived." },
        { name: "Draconic Nature", description: "(Requires: Draconic Punishment): The character receives double the damage from any incoming attacks. As long as the character is engaged in close combat, they do not spend any stamina to block attacks. Blocked heavy attacks only deal 5 damage to the character. Any enemy engaged in close combat with the character receives double damage from the user." },
        { name: "Draconic Commander", description: "(Requires: Draconic Nature) At the start of combat the character performs a leadership check. If passed, no combatant within 50m of the character may disengage their enemy. Every combatant within the radius of the effect receives double damage." },
        { name: "Philosopher Stone", description: "The character does not use essence to cast spells anymore but their own lifeforce instead. To cast spells substitute each common essence with 1HP, each rare essence with 4HP and each cosmic essence with 12HP. This is not optional! The Character cannot regain health except by killing enemies, where they will regain 25% of the killed enemies MAX HEALTH." },
        { name: "Deep Sleeper", description: "During resting phases the character may regenerate an additional D12+6 HP if he sleeps during the resting phase." },
        { name: "Iron Stomach", description: "The character can eat raw meat and other raw ingredients usually not recommended for consumption without suffering any adverse effects. This does not extend to rotten food." },
        { name: "Ravenous Nature", description: "(Requires: Iron Stomach or \"Gluttonous\"- Trait) Whenever the character eats, they start the next battle with 2 extra stamina." },
        { name: "Economic", description: "The character only needs rations once in two days before adverse effects start manifesting." },
        { name: "Fasting", description: "(Requires Economic) The character only needs rations once in three days before adverse effects start manifesting. Cannot be chosen with the negative trait “Gluttonous”." },
        { name: "Warhorse", description: "Every time you spend 1 point of stamina to attack, the hit target receives 1D4 damage if the attack was successful." },
        { name: "Brute", description: "(Requires Warhorse) Every time you spend 1 point of stamina to attack, the hit target receives 1D8 damage if the attack was successful." },
        { name: "War Veteran", description: "(Requires: Brute) Changes the effect of Brute to: Every time you spend 1 point of stamina to attack, the hit target receives 1D12 damage if the attack was successful." },
        { name: "Magic Economist", description: "When landing a critical hit with a spell you can choose one essence used for the spell you cast. It is not used up." },
        { name: "Alchemistic Powerhouse", description: "For every essence used to cast an attack spell you deal +1 damage." },
        { name: "Mage Cannon", description: "(Requires Alchemistic Powerhouse) For every essence used to cast an attack spell you deal an additional +1 damage." },
        { name: "Mage’s Matrix", description: "When casting a spell you can replace one wind, earth, water, fire, ice essence with a force essence to cast the spell." },
        { name: "Master Alchemist", description: "(Requires Mage's Matrix) When casting a spell you can replace any one essence except cosmic essence with a force essence to cast the spell." },
        { name: "Sage", description: "Allows you to spend a resting phase to convert 20 force essences into whichever type you desire." },
        { name: "Supporter", description: "The first time you cast a spell on yourself or a party member during combat you gain 3 DEF and MDEF for the remainder of the fight." },
        { name: "Tank", description: "Every time you cast a spell on yourself or a party member during combat you heal 3 HP" },
        { name: "Leech", description: "When damaging an enemy with an attack spell you regain 2 HP" },
        { name: "Overcharge", description: "Spend twice the essence to cast a spell. The spell will the have it's damage or duration doubled. For each essence used to cast this spell, you receive 2HP damage." },
        { name: "Fancy Visuals", description: "When casting a spell, the character will make it look like it is much more powerful than it actually is. This can benefit persuasion or intimidation attempts. The GM has to grant the player a bonus on any such attempts with spellcasting but will decide how big the bonus is in context." },
        { name: "Critical Precision", description: "Critical hits now also occur, when you roll a 19 as an attacker instead of only a 20." },
        { name: "Unbound", description: "The character can disengage an enemy without penalty." },
        { name: "Nimble Evasion", description: "Allows the character to spend 2 additional stamina to perform an acrobatic dodge, granting a +4 bonus to dodge rolls for the remainder of the battle." },
        { name: "Resilient Mind", description: "The character gains a +2 bonus to MDEF after successfully blocking a spell for the rest of the battle." },
        { name: "Resilient Body", description: "The character gains a +2 bonus to DEF for the rest of the battle, after successfully blocking an attack." },
        { name: "Fortitude", description: "Once per battle, the character can endure a debilitating status effect (vulnerable, stun, heatstroke, undercooled, poison, bleeding) and negate their effects for one turn." },
        { name: "Adrenalin Rush", description: "Stamina regeneration is increased by 1 point if the character has less than 20% of their health." },
        { name: "Surprise Attack!", description: "Enemies become Vulnerable after the first damage they received from the character with this skill. (Vulnerable: The afflicted is unable to block or dodge)" },
        { name: "Essence Adept", description: "The character gains a deeper connection with the natural energies of the world, increasing the amount of essence gathered from the environment by 1 for every type of essence found" },
        { name: "Elemental Tracker", description: "The character hones their senses to detect the presence of elemental essences nearby. They gain the ability to sense the closest source of elemental essence within a 100-meter radius. This skill does not reveal the exact location but provides a general direction. Perception/ Foraging +3 when searching essences." },
        { name: "Efficient Harvesting", description: "Through extensive practice, the character becomes more efficient at collecting essences, reducing the time required to extract essences by 30%. This skill applies to all types of essences, including both basic and advanced ones." },
        { name: "Mystical Resonance", description: "The character learns to resonate with the elemental energies, allowing them to gather elemental essences even from unconventional sources. They can extract elemental essences from objects or beings that have been influenced by the respective element, such as burnt wood for Fire essence or frozen artifacts for Ice essence." },
        { name: "Ethereal Harvest", description: "The character's connection with the ethereal realm allows them to extract rare and advanced essences with greater ease. They receive a 20% bonus to gathering Light, Lightning, Metal, and Space essences." },
        { name: "Ritualistic Mastery", description: "Through the mastery of ancient rituals and alchemical practices, the character gains the ability to create essence-infused items. They can imbue objects with essences, creating potions, charms, or artifacts." },
        { name: "Enchanted Siphon", description: "The character's magical prowess allows them to siphon essence from magical creatures or enchanted objects. When in combat with magical beings, they have a chance to extract essences directly from their opponents during the battle." },
        { name: "Cosmic Attunement", description: "The character achieves a heightened connection to cosmic energies, granting them the unique ability to collect Space essence from distant cosmic sources. They can extract Space essence from fallen meteorites, comets, or fragments of celestial bodies, granting them access to this rare essence." }    
    ];

    for (let level = 1; level <= maxLevel; level++) {
        const row = tableBody.insertRow();
        const cellLevel = row.insertCell(0);
        const cellWeaponAbility = row.insertCell(1);
        const cellAdditionalAbility = row.insertCell(2);

        cellLevel.textContent = level;
        
        // Weapon ability select and button
        const weaponSelect = document.createElement('select');
        weaponSelect.className = 'weapon-ability-select';
        weaponSelect.dataset.level = level; // data attribute for level
        weaponSelect.innerHTML = '<option value="">Select Ability</option>' +
            weaponAbilities.map(ability => `<option value="${ability.name}">${ability.name}</option>`).join('');
        cellWeaponAbility.appendChild(weaponSelect);
        const weaponLearnMore = document.createElement('button');
        weaponLearnMore.textContent = 'Learn More';
        weaponLearnMore.onclick = () => showToast(weaponAbilities[weaponSelect.selectedIndex - 1].description);
        cellWeaponAbility.appendChild(weaponLearnMore);

        // Additional ability select and button for even levels
        if (level % 2 === 0) {
            const additionalSelect = document.createElement('select');
            additionalSelect.className = 'additional-ability-select';
            additionalSelect.dataset.level = level; // data attribute for level
            additionalSelect.innerHTML = '<option value="">Select Ability</option>' +
                additionalAbilities.map(ability => `<option value="${ability.name}">${ability.name}</option>`).join('');
            cellAdditionalAbility.appendChild(additionalSelect);
            const additionalLearnMore = document.createElement('button');
            additionalLearnMore.textContent = 'Learn More';
            additionalLearnMore.onclick = () => showToast(additionalAbilities[additionalSelect.selectedIndex - 1].description);
            cellAdditionalAbility.appendChild(additionalLearnMore);
        } else {
            cellAdditionalAbility.textContent = '—'; // Indicating no ability available
        }
    }
}

function addWeapon(weaponData = {}) {
    let weaponId = 0;
    weaponId++;
    const container = document.getElementById('weapons-container');
    const weaponDiv = document.createElement('div');
    weaponDiv.className = 'weapon';
    weaponDiv.id = 'weapon' + weaponId;

    weaponDiv.innerHTML = `
        <div class="weapon-name">
            <input type="text" placeholder="Weapon Name" id="name${weaponId}" value="${weaponData.name || ''}">
        </div>
        <div class="weapon-config">
            <label for="weaponType${weaponId}">Weapon Type:</label>
            <select id="weaponType${weaponId}">
                <option value="light-vit" ${weaponData.type === 'light-vit' ? 'selected' : ''}>Light (VIT)</option>
                <option value="medium-vit" ${weaponData.type === 'medium-vit' ? 'selected' : ''}>Medium (VIT)</option>
                <option value="heavy-vit" ${weaponData.type === 'heavy-vit' ? 'selected' : ''}>Heavy (VIT)</option>
                <option value="light-fit" ${weaponData.type === 'light-fit' ? 'selected' : ''}>Light (FIT)</option>
                <option value="medium-fit" ${weaponData.type === 'medium-fit' ? 'selected' : ''}>Medium (FIT)</option>
                <option value="heavy-fit" ${weaponData.type === 'heavy-fit' ? 'selected' : ''}>Heavy (FIT)</option>
                <option value="light-thm" ${weaponData.type === 'light-thm' ? 'selected' : ''}>Light (THM)</option>
                <option value="medium-thm" ${weaponData.type === 'medium-thm' ? 'selected' : ''}>Medium (THM)</option>
                <option value="heavy-thm" ${weaponData.type === 'heavy-thm' ? 'selected' : ''}>Heavy (THM)</option>
            </select>
                
            <label for="baseDamage${weaponId}">Base Damage:</label>
            <input type="number" id="baseDamage${weaponId}" min="0" value="0">
            <label for="diceNumber${weaponId}">Number of Dice:</label>
            <input type="number" id="diceNumber${weaponId}" min="1" value="${weaponData.diceNumber || 1}">

            <label for="diceType${weaponId}">Type of Dice:</label>
            <select id="diceType${weaponId}">
                <option value="D4" ${weaponData.diceType === 'D4' ? 'selected' : ''}>D4</option>
                <option value="D6" ${weaponData.diceType === 'D6' ? 'selected' : ''}>D6</option>
                <option value="D8" ${weaponData.diceType === 'D8' ? 'selected' : ''}>D8</option>
                <option value="D10" ${weaponData.diceType === 'D10' ? 'selected' : ''}>D10</option>
                <option value="D12" ${weaponData.diceType === 'D12' ? 'selected' : ''}>D12</option>
                <option value="D20" ${weaponData.diceType === 'D20' ? 'selected' : ''}>D20</option>
            </select>
            </div>
            <div class="weapon-actions">
                <button onclick="calculateDamage(${weaponId})">Attack</button>
                <button onclick="deleteWeapon(${weaponId})">Delete Weapon</button>
            </div>
    `;
    container.appendChild(weaponDiv);

    // Debugging to ensure IDs are properly assigned and elements are created
    // console.log(`Weapon added with ID: weapon${weaponId}`);
}

function showToast(message) {
    const container = document.getElementById('toastContainer') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    // Add a close button (for visual cue, optional)
    const closeButton = document.createElement('span');
    closeButton.textContent = '';
    closeButton.style.float = 'right';
    closeButton.style.color = '#FFA500';
    closeButton.style.fontSize = '30px';
    closeButton.style.cursor = 'pointer'; // Make it look clickable
    toast.style.maxWidth = '80%';
    toast.appendChild(closeButton);

    // Event to close the toast
    toast.addEventListener('click', function() {
        toast.style.opacity = 0;
        toast.style.transform = 'translateX(10px)'; // Slide out
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 500); // Wait for animation to finish before removing
    });

    container.appendChild(toast);

    // Make toast visible with delay for animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    document.body.appendChild(container);
    return container;
}

function calculateDamage(weaponId) {
    const baseDamage = parseInt(document.getElementById(`baseDamage${weaponId}`).value);
    const diceNumber = parseInt(document.getElementById(`diceNumber${weaponId}`).value);
    const diceType = document.getElementById(`diceType${weaponId}`).value;
    const weaponType = document.getElementById(`weaponType${weaponId}`).value.split('-');

    let attribute = parseInt(document.getElementById(weaponType[1]).value);
    let modifier;

    switch (weaponType[0]) {
        case 'heavy':
            modifier = 1;
            break;
        case 'medium':
            modifier = 2;
            break;
        case 'light':
            modifier = 4;
            break;
        default:
            modifier = 1; // Default to heavy if undefined
    }

    let totalDamage = baseDamage;
    for (let i = 0; i < diceNumber; i++) {
        totalDamage += rollDice(diceType);
    }

    totalDamage += Math.floor(attribute / modifier);
    showToast('Total Damage: ' + totalDamage);
}

function rollDice(diceType) {
    let max = parseInt(diceType.substring(1)); // Extracts the number part from dice type like 'D6' -> 6
    return Math.floor(Math.random() * max) + 1; // Generates a random number between 1 and max
}

function deleteWeapon(weaponId) {
    if (confirm('Are you sure you want to delete this weapon?')) {
        var weapon = document.getElementById('weapon' + weaponId);
        if (weapon) {
            weapon.parentNode.removeChild(weapon);
        }
    }
}

function updateTotalDEFMDEF() {
    let totalDEF = 0;
    let totalMDEF = 0;
    const defInputs = document.querySelectorAll('.armor-def');
    const mdefInputs = document.querySelectorAll('.armor-mdef');

    defInputs.forEach(input => {
        const value = parseInt(input.value) || 0;
        totalDEF += value;
    });

    mdefInputs.forEach(input => {
        const value = parseInt(input.value) || 0;
        totalMDEF += value;
    });

    document.getElementById('totalDEF').value = totalDEF;  // Assuming you have an input or element with this ID to display total DEF
    document.getElementById('totalMDEF').value = totalMDEF;  // Assuming you have an input or element with this ID to display total MDEF
}

function toggleSection(...sectionIds) {
    sectionIds.forEach(sectionId => {
        var section = document.getElementById(sectionId);
        if (!section) return; // If the section doesn't exist, skip

        // Check and toggle based on the current display style and the original style set in a data attribute
        if (section.style.display === 'none') {
            // Restore the original display type from a data attribute or default to 'block' if not specified
            section.style.display = section.dataset.displayType || 'block';
        } else {
            // Store the current display type in a data attribute before hiding
            section.dataset.displayType = getComputedStyle(section).display;
            section.style.display = 'none';
        }
    });
}

// Ensure 'buffDescriptions' is declared only once in a global scope accessible by all relevant functions
if (typeof buffDescriptions === 'undefined') {
    var buffDescriptions = {
        'Choose a Buff': 'Select a buff to see its description.',
        'Sprint': 'Doubles the movement speed for the duration',
        'Buff 2': 'Description for Buff 2.',
        'Buff 3': 'Description for Buff 3.'
    };
}
    
    function showDescription(buffDropdown, descriptionBox) {
    const selectedBuff = buffDropdown.value;
    descriptionBox.textContent = buffDescriptions[selectedBuff] || 'No description available.';
}

function addBuff() {
    const container = document.getElementById('buff-list');
    const buffEntry = document.createElement('div');
    buffEntry.className = 'buff-entry';

    const buffDropdown = document.createElement('select');
    buffDropdown.className = 'buff-dropdown';
    const options = ['Choose a Buff', 'Sprint', 'Buff 2', 'Buff 3'];
    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.innerHTML = option;
        buffDropdown.appendChild(opt);
    });

    const descriptionBox = document.createElement('div');
    descriptionBox.className = 'buff-description';
    descriptionBox.textContent = buffDescriptions['Choose a Buff'];  // Default description
    buffDropdown.onchange = () => showDescription(buffDropdown, descriptionBox); // Use arrow function for simplicity

    const durationInput = document.createElement('input');
    durationInput.type = 'number';
    durationInput.className = 'duration-input';
    durationInput.value = 5;
    durationInput.min = 1;

    buffEntry.appendChild(buffDropdown);
    buffEntry.appendChild(durationInput);
    buffEntry.appendChild(descriptionBox);
    container.appendChild(buffEntry);
}

function initializeAilments() {
        const ailmentsData = [
                { icon: 'fa-skull', name: ' Death', description: 'The character is killed instantly.' },
                { icon: 'fa-snowflake', name: ' Cold', description: 'Stamina regeneration is reduced by 1 per round.' },
                { icon: 'fa-snowman', name: ' Hypothermia', description: 'The afflicted takes 1D6 damage each round, stamina regeneration is reduced by 1 and movement is reduced by 3m.' },
                { icon: 'fa-snowflake', name: ' Frostbite', description: 'The afflicted takes 1D12 damage to max HP per hour until death or until the ailment is cured. Lost max HP are restored upon revival or treatment. If more than 50% of Max HP have been lost this turns into Deep Frostbite.' },
                { icon: 'fa-snowflake', name: ' Deep Frostbite', description: 'The afflicted takes 1D12 damage to max HP per hour until death. Can only be cured by amputating frostbitten limbs.' },
                { icon: 'fa-icicles', name: ' Frozen', description: 'The afflicted skips their turn until they receive damage or until 5 rounds have passed. After this ailment wears off the afflicted suffers the effects of hypothermia for one round. (The afflicted takes 1D6 damage each round, stamina regeneration is reduced by 1 and movement is reduced by 3m.)' },
                { icon: 'fa-temperature-full', name: ' Heat', description: 'Stamina regeneration is halved.' },
                { icon: 'fa-sun', name: ' Heat Stroke', description: 'The afflicted takes 12 damage per round in combat or per minute outside of combat.' },
                { icon: 'fa-fire', name: 'Burning', description: 'The afflicted takes continuous fire damage over time. Each round, they lose 20% of their health. The character can use their entire turn to put out the fire. The character does not regenerate stamina in the next turn after they do so.' },
                { icon: 'fa-glass-martini-alt', name: ' Drunk', description: 'When casting spells and rolling the D20, the spell fails if the result is an uneven number and its effect is changed to: “The caster takes 1 HP damage for every essence used to cast this spell."' },
                { icon: 'fa-wine-bottle', name: ' Heavily Drunk', description: 'In addition to the effects of “Drunk” the afflicted now gets a penalty of -2 to every attack or parry attempt and all dodge attempts will result in the character becoming “Vulnerable” after the attempt' },
                { icon: 'fa-dizzy', name: ' Stunned', description: 'The afflicted skips their next turn.' },
                { icon: 'fa-user-injured', name: ' Toppled', description: 'The afflicted is lying on the ground and has a -5 penalty on all attack or defend checks until they move during their turn.' },
                { icon: 'fa-procedures', name: ' Unconscious', description: 'The afflicted is unable to act until woken up.' },
                { icon: 'fa-shield-alt', name: ' Vulnerable', description: 'The afflicted is unable to block or dodge.' }
    ];

    const container = document.querySelector('.ailments-container');
    ailmentsData.forEach((ailment, index) => {
        const ailmentDiv = document.createElement('div');
        ailmentDiv.className = 'ailment';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `ailment${index}`;
        checkbox.className = 'ailment-checkbox';

        const label = document.createElement('label');
        label.htmlFor = `ailment${index}`;
        label.className = 'tooltip';
        label.innerHTML = `<i class="${'fas ' + ailment.icon}" aria-hidden="true"></i> <span>${ailment.name}</span>`;

        const tooltipSpan = document.createElement('span');
        tooltipSpan.className = 'tooltiptext';
        tooltipSpan.textContent = ailment.description;
        label.appendChild(tooltipSpan);

        ailmentDiv.appendChild(checkbox);
        ailmentDiv.appendChild(label);
        container.appendChild(ailmentDiv);
    });
}

function newRound() {
    const buffs = document.querySelectorAll('.buff-entry');
    buffs.forEach(buff => {
        const durationInput = buff.querySelector('input[type="number"]');
        let duration = parseInt(durationInput.value) - 1;
        if (duration <= 0) {
            buff.parentNode.removeChild(buff);
        } else {
            durationInput.value = duration;
        }
    });

    // Handle Bleeding
    const bleedingStacks = document.getElementById('bleedingStacks');
    let currentBleeding = parseInt(bleedingStacks.value);
    if (currentBleeding > 0) {
        const hpInput = document.getElementById('hp');
        let currentHP = parseInt(hpInput.value);
        currentHP -= currentBleeding;
        currentBleeding = Math.max(0, currentBleeding - 1);
        bleedingStacks.value = currentBleeding;
        hpInput.value = currentHP;
    }

    // Handle Poison
    const poisonStacks = document.getElementById('poisonStacks');
    let currentPoison = parseInt(poisonStacks.value);
    if (currentPoison > 0) {
        const hpInput = document.getElementById('hp');
        let currentHP = parseInt(hpInput.value);
        currentHP -= currentPoison;
        currentPoison = Math.min(20, currentPoison + 1);
        poisonStacks.value = currentPoison;
        hpInput.value = currentHP;
    }

    // Update Stamina
    const stamPerRound = parseInt(document.getElementById('sta').value) || 0;
    const currentStam = document.getElementById('stamina');
    let currentStamValue = parseInt(currentStam.value) || 0;
    currentStamValue += stamPerRound;
    currentStamValue = Math.min(10, currentStamValue);
    currentStamValue = Math.max(0, currentStamValue);
    currentStam.value = currentStamValue;

    // Reset Current Essences Per Round to the Essences Per Round value
    const eprElement = document.getElementById('epr');
    const ceprElement = document.getElementById('cepr');
    ceprElement.value = eprElement.value;  // Reset CEPR to EPR at the start of each round

   // console.log("Updated Stamina, Ailment Stacks, and Reset Essence Count for the Round");
}

function rest() {
    const maxHpInput = document.getElementById('maxHP');
    const hpInput = document.getElementById('hp');

    if (maxHpInput && hpInput) {
        const maxHP = parseInt(maxHpInput.value, 10);
        let currentHP = parseInt(hpInput.value, 10);
        const restoreHP = Math.ceil(maxHP * 0.5);  // Calculate 50% of Max HP and round up
        currentHP += restoreHP;  // Add 50% of max HP to current HP
        if (currentHP > maxHP) currentHP = maxHP;  // Ensure current HP does not exceed max HP

        hpInput.value = currentHP;
        showToast(`You have rested. Your health is increased by ${restoreHP} HP, total health is now ${currentHP}.`);
    }
}

const essenceIcons = {
    wind: '<i class="corner-icon ra ra-feathered-wing ra-2x" style="color: #ced3d7;"></i>',
    water: '<i class="corner-icon ra ra-droplet ra-2x" style="color: #3471cf;"></i>',
    earth: '<i class="ra ra-groundbreaker ra-2x" style="color: #4d3221;"></i>',
    fire: '<i class="ra ra-small-fire ra-2x" style="color: #e16320;"></i>',
    ice: '<i class="ra ra-snowflake ra-2x" style="color: #a4e2e4;"></i>',
    force: '<i class="ra ra-blaster ra-2x" style="color: #bba090;"></i>',
    light: '<i class="ra ra-moon-sun ra-2x" style="color: #f4e2ab;"></i>',
    lightning: '<i class="ra ra-lightning-trio ra-2x" style="color: #eeeeda;"></i>',
    metal: '<i class="ra ra-gold-bar ra-2x" style="color: #6e6f75;"></i>',
    cosmic: '<i class="ra ra-ball ra-2x" style="color: #3e3756;"></i>'
};

const staminaIcon = '<i class="ra ra-lightning-bolt ra-lg" style="color: gold;"></i>'; // Example icon

var globalSpells = {
    Dynamist: [
        {
            name: "Shield",
            type: "Buff",
            target: "self / ally",
            essenceCost: { Force: 1 },
            essenceTotalCost: 1,
            staminaCost: 1,
            unlockedAtLevel: "1",
            cost: [
                { type: 'force', quantity: 1, iconHtml: essenceIcons.force }
            ],
            range: "-",
            stamina: "1",
            damage: "-",
            duration: "1 round",
            description: "The caster forms a protective barrier around themselves or an ally, granting +5 DEF and +5MDEF for 1 round. This effect is stackable in strength.",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Dash",
            type: "Movement",
            target: "self",
            essenceCost: { Force: 2 },
            essenceTotalCost: 2,
            staminaCost: 0,
            unlockedAtLevel: "1",
            cost: [
                { type: 'force', quantity: 2, iconHtml: essenceIcons.force }
            ],
            range: "-",
            stamina: "0",
            damage: "-",
            duration: "-",
            description: "Up to 3 times per turn: The caster focuses on speed alone and enhances their running speed or that of an ally increasing their movement by an additional 5m that are not influenced by terrain or weather conditions.",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Distort",
            type: "Buff",
            target: "self",
            essenceCost: { Force: 3 },
            essenceTotalCost: 3,
            staminaCost: 1,
            unlockedAtLevel: "1",
            cost: [
                { type: 'force', quantity: 3, iconHtml: essenceIcons.force }
            ],
            range: "-",
            stamina: "1",
            damage: "-",
            duration: "1 round",
            description: "The caster manipulates the speed of their actions, creating a slightly better time frame to dodge. Grants the caster +4 to dodging for 1 round.",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Echo",
            type: "Misc.",
            target: "area",
            essenceCost: { Force: 1 },
            essenceTotalCost: 1,
            staminaCost: 0,
            unlockedAtLevel: "1",
            cost: [
                { type: 'force', quantity: 1, iconHtml: essenceIcons.force }
            ],
            range: "25m",
            stamina: "0",
            damage: "-",
            duration: "-",
            description: "The caster resonates with the ambient energy, allowing them to record sounds, phrases and noises they've heard within the past minute and recreate them at any time up to 25m away, creating auditory distractions. Only one recording can be held at a time.",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Grasp",
            type: "Misc.",
            target: "any",
            essenceCost: { Force: 3 },
            essenceTotalCost: 3,
            staminaCost: 1,
            unlockedAtLevel: "1",
            cost: [
                { type: 'force', quantity: 3, iconHtml: essenceIcons.force }
            ],
            range: "15m",
            stamina: "1",
            damage: "-",
            duration: "1 round",
            description: "The caster creates an invisible force grip around a small object or creature (at most a quarter of the casters size) within 15m, allowing them to move or manipulate it remotely for one round.",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Infusion",
            type: "Buff",
            target: "self",
            essenceCost: { Force: 4 },
            essenceTotalCost: 4,
            staminaCost: 0,
            unlockedAtLevel: "1",
            cost: [
                { type: 'force', quantity: 4, iconHtml: essenceIcons.force }
            ],
            range: "-",
            stamina: "0",
            damage: "+1D12 physical damage",
            duration: "3 rounds",
            description: "The caster channels a surge of power into a weapon or item held by them or an ally, granting +1D12 physical damage on the next successful attack. Lasts only 3 rounds if no attack is successful, effect cannot be stacked and cannot be used outside of combat.",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Insight",
            type: "Buff",
            target: "self",
            essenceCost: { Force: 1 },
            essenceTotalCost: 1,
            staminaCost: 0,
            unlockedAtLevel: "1",
            cost: [
                { type: 'force', quantity: 1, iconHtml: essenceIcons.force }
            ],
            range: "-",
            stamina: "0",
            damage: "-",
            duration: "1 hour",
            description: "The caster attunes their senses granting them +2 perception for an hour. This effect cannot be stacked.",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Levitate",
            type: "Buff / Misc.",
            target: "self / ally",
            essenceCost: { Force: 2 },
            essenceTotalCost: 2,
            staminaCost: 1,
            unlockedAtLevel: "1",
            cost: [
                { type: 'force', quantity: 2, iconHtml: essenceIcons.force }
            ],
            range: "-",
            stamina: "1",
            damage: "-",
            duration: "3 rounds",
            description: "The caster uses force essence and concentrates to lift themselves, an ally or an object weighing up to 10 kilograms into the air, allowing them to float for 3 rounds. Levitating makes the target immune to terrain effects that only apply to the floor (spikes, mud, sand, etc.)",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Mend",
            type: "Healing",
            target: "self",
            essenceCost: { Force: 8 },
            essenceTotalCost: 8,
            staminaCost: 0,
            unlockedAtLevel: "1",
            cost: [
                { type: 'force', quantity: 8, iconHtml: essenceIcons.force }
            ],
            range: "-",
            stamina: "0",
            damage: "heals 1D6 hit points",
            duration: "per stamina point available",
            description: "Once per round: The caster channels energy into a wound on themselves or an ally, healing 1D6 hit points for every stamina point available before the cast.",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Power Jump",
            type: "Movement",
            target: "self",
            essenceCost: { Force: 1 },
            essenceTotalCost: 1,
            staminaCost: 1,
            unlockedAtLevel: "1",
            cost: [
                { type: 'force', quantity: 1, iconHtml: essenceIcons.force }
            ],
            range: "-",
            stamina: "1",
            damage: "-",
            duration: "-",
            description: "The caster directs as much force as possible into their legs allowing them to jump up to 10m high and land without taking damage from the same height.",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Push",
            type: "Attack",
            target: "enemy",
            essenceCost: { Force: 4 },
            essenceTotalCost: 4,
            staminaCost: 1,
            unlockedAtLevel: "1",
            cost: [
                { type: 'force', quantity: 4, iconHtml: essenceIcons.force }
            ],
            range: "10 meters",
            stamina: "1",
            damage: "1D6 force damage",
            duration: "-",
            description: "The caster projects a burst of energy at a target within 10 meters, pushing them back by 5 meters and dealing 1D6 force damage and proportionate damage to the targets weight, should they hit an obstacle (Game Master decision)",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Recklessness",
            type: "Buff",
            target: "self",
            essenceCost: { Force: 4 },
            essenceTotalCost: 4,
            staminaCost: 0,
            unlockedAtLevel: "1",
            cost: [
                { type: 'force', quantity: 4, iconHtml: essenceIcons.force }
            ],
            range: "-",
            stamina: "0",
            damage: "-",
            duration: "-",
            description: "The Dynamist ignores their own physical wellbeing and goes beyond their limit to regain stamina, damaging themself in the process more and more when repeatedly using this spell during a short period of time. Restores 1 point of stamina but deals 5 damage more to the caster for every time this spell has been used during the same encounter (5, 10, 15, 20,...)",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Shove",
            type: "Attack",
            target: "enemy",
            essenceCost: { Force: 4 },
            essenceTotal: 4, 
            Cost: 4,
            staminaCost: 1,
            unlockedAtLevel: "1",
            cost: [
                { type: 'force', quantity: 4, iconHtml: essenceIcons.force }
            ],
            range: "5 meters",
            stamina: "1",
            damage: "1D4 force damage",
            duration: "-",
            description: "The caster directs a concentrated burst of force at a target within 5 meters, knocking them Vulnerable and dealing 1D4 force damage.",
            effect: "-",
            thmMultiplier: "-"
        }
    ],
    Elementalist: [
        {
            name: "Accelerate",
            type: "Buff",
            target: "self/ally",
            essenceCost: { Wind: 3, Lightning: 1 },
            essenceTotalCost: 4,
            staminaCost: 1,
            unlockedAtLevel: "1",
            cost: [
                { type: 'wind', quantity: 3, iconHtml: essenceIcons.wind },
                { type: 'lightning', quantity: 1, iconHtml: essenceIcons.lightning }
            ],
            range: "-",
            stamina: "1",
            damage: "-",
            duration: "1 round",
            description: "Increases movement of a target by 4m and halves stamina cost for one round (always rounded up, light weapon attack stamina cost cannot be reduced).",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Aura of Light",
            type: "Misc.",
            target: "self/ally",
            essenceCost: { Wind: 1, Light: 1 },
            essenceTotalCost: 2,
            staminaCost: 1,
            unlockedAtLevel: "1",
            cost: [
                { type: 'wind', quantity: 1, iconHtml: essenceIcons.wind },
                { type: 'light', quantity: 1, iconHtml: essenceIcons.light }
            ],
            range: "6m",
            stamina: "1",
            damage: "-",
            duration: "20 minutes",
            description: "The target starts emitting a dim light for 20 minutes that illuminates their surroundings in a 6m radius.",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Brazier",
            type: "Misc.",
            target: "area",
            essenceCost: { Earth: 2, Fire: 1 },
            essenceTotalCost: 3,
            staminaCost: 1,
            unlockedAtLevel: "1",
            cost: [
                { type: 'earth', quantity: 2, iconHtml: essenceIcons.earth },
                { type: 'fire', quantity: 1, iconHtml: essenceIcons.fire }
            ],
            range: "-",
            stamina: "1",
            damage: "-",
            duration: "10 minutes",
            description: "Creates a brazier that grows out of the ground with a small flame that burns for 10 minutes. The flame can be kindled to extend the duration like with normal fire.",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Bright Spark",
            type: "Misc.",
            target: "light sources",
            essenceCost: { Fire: 1, Light: 1 },
            essenceTotalCost: 2,
            staminaCost: 1,
            unlockedAtLevel: "1",
            cost: [
                { type: 'fire', quantity: 1, iconHtml: essenceIcons.fire },
                { type: 'light', quantity: 1, iconHtml: essenceIcons.light }
            ],
            range: "20m",
            stamina: "1",
            damage: "1D20",
            duration: "-",
            description: "The Elementalist increases the brightness of an already existing lightsource up to 20m away. This spell cannot be cast on the same source of light again within 10 minutes or more than 5 times or it will explode and create a bright inferno that damages everything in a 20m radius for 1D20 damage and extinguishes the original light source.",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Catalyst",
            type: "Buff",
            target: "ally",
            essenceCost: { Wind: 3 },
            essenceTotalCost: 3,
            staminaCost: 3,
            unlockedAtLevel: "1",
            cost: [
                { type: 'wind', quantity: 3, iconHtml: essenceIcons.wind }
            ],
            range: "-",
            stamina: "3",
            damage: "-",
            duration: "-",
            description: "When you or an ally want to cast a spell, the elementalist can cast 'Catalyst' to change one of the elements of essence required to cast the spell into Wind essence instead. This spell cannot replace Cosmic essence.",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Cool Wind",
            type: "Misc.",
            target: "self/ally",
            essenceCost: { Wind: 1, Ice: 1 },
            essenceTotalCost: 2,
            staminaCost: 1,
            unlockedAtLevel: "1",
            cost: [
                { type: 'wind', quantity: 1, iconHtml: essenceIcons.wind },
                { type: 'ice', quantity: 1, iconHtml: essenceIcons.ice }
            ],
            range: "-",
            stamina: "1",
            damage: "-",
            duration: "20 minutes",
            description: "The Elementalist or a target ally becomes surrounded by a shell of cold air for 20 minutes that prevents Heat and Heat Stroke ailments. Cannot be cast in places without air.",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Earthen Shard",
            type: "Attack",
            target: "enemy",
            essenceCost: { Wind: 1, Earth: 2 },
            essenceTotalCost: 3,
            staminaCost: 1,
            unlockedAtLevel: "1",
            cost: [
                { type: 'wind', quantity: 1, iconHtml: essenceIcons.wind },
                { type: 'earth', quantity: 2, iconHtml: essenceIcons.earth }
            ],
            range: "16m",
            stamina: "1",
            damage: "-",
            duration: "-",
            description: "Launches a shard of earth from the ground from within 5m at a target up to 16m away. The spell fails if there is no earth available within 5m of the caster and stamina and essences are used up.",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Endurance",
            type: "Buff",
            target: "self/ally",
            essenceCost: { Wind: 2, Water: 2 },
            essenceTotalCost: 4,
            staminaCost: 1,
            unlockedAtLevel: "1",
            cost: [
                { type: 'wind', quantity: 2, iconHtml: essenceIcons.wind },
                { type: 'water', quantity: 2, iconHtml: essenceIcons.water }
            ],
            range: "-",
            stamina: "1",
            damage: "-",
            duration: "-",
            description: "The Elementalist or a target party member can do an additional attack (or two if light weapons are being used) during their turn without the use of stamina.",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Incinerate",
            type: "Attack",
            target: "enemy",
            essenceCost: { Wind: 1, Fire: 3 },
            essenceTotalCost: 4,
            staminaCost: 1,
            unlockedAtLevel: "1",
            cost: [
                { type: 'wind', quantity: 1, iconHtml: essenceIcons.wind },
                { type: 'fire', quantity: 3, iconHtml: essenceIcons.fire }
            ],
            range: "-",
            stamina: "1",
            damage: "1D20",
            duration: "3 rounds",
            description: "Engulfs a target in a sphere of fire, causing severe burning and damage. If cast on the same target 3 times within 3 turns, they will start suffering the effects of a Heat Stroke for 3 rounds (duration extends if 'Fireball' is recast before heat stroke runs out).",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Flaming Edge",
            type: "Buff",
            target: "any",
            essenceCost: { Fire: 3 },
            essenceTotalCost: 3,
            staminaCost: 1,
            unlockedAtLevel: "1",
            cost: [
                { type: 'fire', quantity: 3, iconHtml: essenceIcons.fire }
            ],
            range: "-",
            stamina: "1",
            damage: "+3, +6, +12 heat damage (based on weapon weight)",
            duration: "3 rounds",
            description: "Engulfs the business-end of any weapon in flame, giving it +3,+6 or +12 heat damage on each attack for light, medium or heavy weapons respectively. Wooden weapons will be destroyed after the 3 round duration of the spell.",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Fog Veil",
            type: "Buff",
            target: "any",
            essenceCost: { Water: 2, Fire: 1 },
            essenceTotalCost: 3,
            staminaCost: 1,
            unlockedAtLevel: "1",
            cost: [
                { type: 'water', quantity: 2, iconHtml: essenceIcons.water },
                { type: 'fire', quantity: 1, iconHtml: essenceIcons.fire }
            ],
            range: "-",
            stamina: "1",
            damage: "-",
            duration: "-",
            description: "The caster surrounds a target with fog, giving it a bonus of +3 on dodging. The engulfed target can still see clear through the fog.",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Freezing Edge",
            type: "Buff",
            target: "any",
            essenceCost: { Ice: 3 },
            essenceTotalCost: 3,
            staminaCost: 1,
            unlockedAtLevel: "1",
            cost: [
                { type: 'ice', quantity: 3, iconHtml: essenceIcons.ice }
            ],
            range: "-",
            stamina: "1",
            damage: "-",
            duration: "3 rounds",
            description: "The caster enchants a weapon with ice magic. The wearer must have protected hands, drop the weapon, or endure the effects of Frostbite after the third turn of using it. When dealing more than 20 damage in one turn to a target with a weapon with this enchantment, the target will lose 2 stamina.",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Frost Shield",
            type: "Buff",
            target: "ally",
            essenceCost: { Water: 1, Ice: 1 },
            essenceTotalCost: 2,
            staminaCost: 1,
            unlockedAtLevel: "1",
            cost: [
                { type: 'water', quantity: 1, iconHtml: essenceIcons.water },
                { type: 'ice', quantity: 1, iconHtml: essenceIcons.ice }
            ],
            range: "-",
            stamina: "1",
            damage: "-",
            duration: "-",
            description: "Creates a small floating shield of ice that helps a target when they fail to Block an attack. Absorbs 5 points of damage and regenerates next round, but breaks permanently when magical damage is received.",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Glowing Veins",
            type: "Misc.",
            target: "self",
            essenceCost: { Earth: 1, Light: 1 },
            essenceTotalCost: 2,
            staminaCost: 1,
            unlockedAtLevel: "1",
            cost: [
                { type: 'earth', quantity: 1, iconHtml: essenceIcons.earth },
                { type: 'light', quantity: 1, iconHtml: essenceIcons.light }
            ],
            range: "-",
            stamina: "1",
            damage: "-",
            duration: "-",
            description: "Creates glowing stripes on rocks and cave ceilings, dimly illuminating the area. The stripes are no longer or just barely visible with torchlight.",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Icicle Shard",
            type: "Attack",
            target: "enemy",
            essenceCost: { Ice: 4 },
            essenceTotalCost: 4,
            staminaCost: 2,
            unlockedAtLevel: "1",
            cost: [
                { type: 'ice', quantity: 4, iconHtml: essenceIcons.ice }
            ],
            range: "-",
            stamina: "2",
            damage: "-",
            duration: "-",
            description: "Heavy Attack: Creates a heavy shard of ice above a target that drops down to deal damage.",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Icicle Launch",
            type: "Attack",
            target: "enemy",
            essenceCost: { Ice: 4, Wind: 4 },
            essenceTotalCost: 8,
            staminaCost: 2,
            unlockedAtLevel: "1",
            cost: [
                { type: 'ice', quantity: 4, iconHtml: essenceIcons.ice },
                { type: 'wind', quantity: 4, iconHtml: essenceIcons.wind }
            ],
            range: "-",
            stamina: "2",
            damage: "-",
            duration: "-",
            description: "Heavy Attack: Instead of just dropping the ice shard like in the original Spell 'Icicle Shard' this spell launches the ice shard with strong force downward to create a massive impact.",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Liquid Jet",
            type: "Attack",
            target: "enemy",
            essenceCost: { Wind: 1, Water: 2 },
            essenceTotalCost: 3,
            staminaCost: 1,
            unlockedAtLevel: "1",
            cost: [
                { type: 'wind', quantity: 1, iconHtml: essenceIcons.wind },
                { type: 'water', quantity: 2, iconHtml: essenceIcons.water }
            ],
            range: "-",
            stamina: "1",
            damage: "1D20+ THM (direct contact), 1D6+THM (indirect)",
            duration: "-",
            description: "Shoots a jet of high pressurized water out of the hand of the caster to damage a target. If the target is within direct contact of the hand of the caster this deals 1D20+ THM damage, otherwise 1D6+THM.",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Magic Trap Hole",
            type: "Misc.",
            target: "enemy/area",
            essenceCost: { Earth: 4, Cosmic: 1 },
            essenceTotalCost: 5,
            staminaCost: 3,
            unlockedAtLevel: "1",
            cost: [
                { type: 'earth', quantity: 4, iconHtml: essenceIcons.earth },
                { type: 'cosmic', quantity: 1, iconHtml: essenceIcons.cosmic }
            ],
            range: "10m",
            stamina: "3",
            damage: "-",
            duration: "-",
            description: "Creates a 12m wide and deep trap hole within a range of 10m from the caster by throwing rock and dirt out of the hole. The process is instant but the caster cannot do anything else during the round they cast this spell. The trap is then covered with a thin layer of rock that allows the caster and his companions passage, but breaks if an enemy steps on it. Trapped enemies can no longer move, dodge or defend but still attack with ranged attacks.",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Mirage",
            type: "Misc.",
            target: "self/area",
            essenceCost: { Water: 1, Light: 2 },
            essenceTotalCost: 3,
            staminaCost: 1,
            unlockedAtLevel: "1",
            cost: [
                { type: 'water', quantity: 1, iconHtml: essenceIcons.water },
                { type: 'light', quantity: 2, iconHtml: essenceIcons.light }
            ],
            range: "-",
            stamina: "1",
            damage: "-",
            duration: "-",
            description: "Creates an illusory copy of the caster that imitates their movements. The mirage dissipates when taking damage or by getting hit with strong winds. It can imitate the caster's movements but not shoot illusory projectiles or cause the visual effects of a spell.",
            effect: "-",
            thmMultiplier: "-"
        },

    ],
    CurseAdept: [
        {
            name: "Arctic Wind",
            type: "Buff",
            target: "self",
            essenceCost: { Wind: 2, Ice: 2 },
            essenceTotalCost: 4,
            staminaCost: 1,
            unlockedAtLevel: "1",
            cost: [
                { type: 'wind', quantity: 2, iconHtml: essenceIcons.wind },
                { type: 'ice', quantity: 2, iconHtml: essenceIcons.ice }
            ],
            range: "-",
            stamina: "1",
            damage: "-",
            duration: "-",
            description: "The character emits unbearable cold. The area causes Hypothermia to any combatant in range, except for the user. Interrupts 'Heat Wave', 'Warm Wind' and similar effects.",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Baked Earth",
            type: "Misc.",
            target: "area",
            essenceCost: { Fire: 2, Earth: 3 },
            essenceTotalCost: 5,
            staminaCost: 1,
            unlockedAtLevel: "1",
            cost: [
                { type: 'fire', quantity: 2, iconHtml: essenceIcons.fire },
                { type: 'earth', quantity: 3, iconHtml: essenceIcons.earth }
            ],
            range: "-",
            stamina: "1",
            damage: "-",
            duration: "-",
            description: "The caster dries the ground in a cone-shaped area in front of them, causing plants in the affected area to wither and water to evaporate. Enemies are affected by Heat and take fire damage at the beginning of their turn in the area.",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Bang",
            type: "Attack",
            target: "area",
            essenceCost: { Fire: 2, Ice: 2 },
            essenceTotalCost: 4,
            staminaCost: 1,
            unlockedAtLevel: "1",
            cost: [
                { type: 'fire', quantity: 2, iconHtml: essenceIcons.fire },
                { type: 'ice', quantity: 2, iconHtml: essenceIcons.ice }
            ],
            range: "-",
            stamina: "1",
            damage: "-",
            duration: "-",
            description: "The Curse Adept takes both essences in their hand, points with the index finger at a target location while also lifting the thumb and says 'Bang'. A small but loud explosion occurs at the location the caster is pointing at, causing damage if a target is hit.",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Bell Strike",
            type: "Misc.",
            target: "area",
            essenceCost: { Wind: 4, Earth: 1, Metal: 1 },
            essenceTotalCost: 6,
            staminaCost: 1,
            unlockedAtLevel: "1",
            cost: [
                { type: 'wind', quantity: 4, iconHtml: essenceIcons.wind },
                { type: 'earth', quantity: 1, iconHtml: essenceIcons.earth },
                { type: 'metal', quantity: 1, iconHtml: essenceIcons.metal }
            ],
            range: "150m",
            stamina: "1",
            damage: "-",
            duration: "-",
            description: "The caster can make a loud bell strike sound at any point in their field of view up to 150m away. Creatures standing at the center are Stunned. This ability can only stun once per battle. Any additional casts will instead make affected creatures vulnerable.",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Fractured Armor",
            type: "Debuff",
            target: "any",
            essenceCost: { Metal: 2, Water: 2, Ice: 1, Fire: 1 },
            essenceTotalCost: 6,
            staminaCost: 1,
            unlockedAtLevel: "1",
            cost: [
                { type: 'metal', quantity: 2, iconHtml: essenceIcons.metal },
                { type: 'water', quantity: 2, iconHtml: essenceIcons.water },
                { type: 'ice', quantity: 1, iconHtml: essenceIcons.ice },
                { type: 'fire', quantity: 1, iconHtml: essenceIcons.fire }
            ],
            range: "-",
            stamina: "1",
            damage: "-",
            duration: "-",
            description: "Iron weapons, iron armor, and armor become brittle and dull, losing half of their attack strength or defense. Animals with metal armor also lose half of their defense. This effect is permanent and the equipment needs to be repaired.",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Frozen Earth",
            type: "Misc.",
            target: "area",
            essenceCost: { Earth: 3, Ice: 2 },
            essenceTotalCost: 5,
            staminaCost: 1,
            unlockedAtLevel: "1",
            cost: [
                { type: 'earth', quantity: 3, iconHtml: essenceIcons.earth },
                { type: 'ice', quantity: 2, iconHtml: essenceIcons.ice }
            ],
            range: "-",
            stamina: "1",
            damage: "-",
            duration: "-",
            description: "The caster freezes the ground in a cone-shaped area in front of them, causing almost all plants in the affected area to wither. Water freezes up to 0.5m deep and becomes passable. Enemies take ice damage at the beginning of their turn in the area.",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Glowing Veins",
            type: "Misc.",
            target: "area",
            essenceCost: { Earth: 1, Light: 1 },
            essenceTotalCost: 2,
            staminaCost: 1,
            unlockedAtLevel: "1",
            cost: [
                { type: 'earth', quantity: 1, iconHtml: essenceIcons.earth },
                { type: 'light', quantity: 1, iconHtml: essenceIcons.light }
            ],
            range: "-",
            stamina: "1",
            damage: "-",
            duration: "-",
            description: "Creates glowing stripes on rocks and cave ceilings, dimly illuminating the area. The stripes are no longer or just barely visible with torchlight.",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Grassland",
            type: "Misc.",
            target: "area",
            essenceCost: { Earth: 3, Water: 1 },
            essenceTotalCost: 4,
            staminaCost: 1,
            unlockedAtLevel: "1",
            cost: [
                { type: 'earth', quantity: 3, iconHtml: essenceIcons.earth },
                { type: 'water', quantity: 1, iconHtml: essenceIcons.water }
            ],
            range: "-",
            stamina: "1",
            damage: "-",
            duration: "-",
            description: "The caster covers the ground in a cone-shaped area in front of them with a layer of rapidly growing grass (up to 50cm tall).",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Gushing Wounds",
            type: "Buff",
            target: "self",
            essenceCost: { Ice: 2, Water: 2 },
            essenceTotalCost: 4,
            staminaCost: 1,
            unlockedAtLevel: "1",
            cost: [
                { type: 'ice', quantity: 2, iconHtml: essenceIcons.ice },
                { type: 'water', quantity: 2, iconHtml: essenceIcons.water }
            ],
            range: "-",
            stamina: "1",
            damage: "-",
            duration: "-",
            description: "The Curse Adept enchants their hands or bladed weapon with malevolent force. Every successful attack the caster deals this turn with a bladed weapon or unarmed strikes will give the target 2, 3 or 4 stacks of Bleeding depending on the weapon type (light, medium, heavy).",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Healing Mist",
            type: "Healing",
            target: "area",
            essenceCost: { Water: 2, Fire: 2, Light: 2 },
            essenceTotalCost: 6,
            staminaCost: 1,
            unlockedAtLevel: "1",
            cost: [
                { type: 'water', quantity: 2, iconHtml: essenceIcons.water },
                { type: 'fire', quantity: 2, iconHtml: essenceIcons.fire },
                { type: 'light', quantity: 2, iconHtml: essenceIcons.light }
            ],
            range: "2m",
            stamina: "1",
            damage: "-",
            duration: "3 rounds",
            description: "The caster is surrounded by green mist in a radius of 2m for 3 rounds, healing themselves and allies.",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Heat Wave",
            type: "Buff",
            target: "self",
            essenceCost: { Wind: 2, Fire: 2 },
            essenceTotalCost: 4,
            staminaCost: 1,
            unlockedAtLevel: "1",
            cost: [
                { type: 'wind', quantity: 2, iconHtml: essenceIcons.wind },
                { type: 'fire', quantity: 2, iconHtml: essenceIcons.fire }
            ],
            range: "-",
            stamina: "1",
            damage: "-",
            duration: "-",
            description: "Creates an area of hot air or water currents around the caster. The area has the same effect on all combatants, as desert heat (half stamina regeneration), except on the user themself. Interrupts 'Cold Wind', 'Arctic Wind' and similar effects.",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Ice Ball",
            type: "Attack",
            target: "enemy",
            essenceCost: { Ice: 4 },
            essenceTotalCost: 4,
            staminaCost: 1,
            unlockedAtLevel: "1",
            cost: [
                { type: 'ice', quantity: 4, iconHtml: essenceIcons.ice }
            ],
            range: "-",
            stamina: "1",
            damage: "-",
            duration: "2 rounds",
            description: "The Curse Adept throws a ball of ice that freezes an area upon impact. Enemies in the impact area take cold damage and suffer Hypothermia for 2 rounds. This duration can stack.",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Ice Light",
            type: "Misc.",
            target: "self",
            essenceCost: { Light: 1, Ice: 1 },
            essenceTotalCost: 2,
            staminaCost: 1,
            unlockedAtLevel: "1",
            cost: [
                { type: 'light', quantity: 1, iconHtml: essenceIcons.light },
                { type: 'ice', quantity: 1, iconHtml: essenceIcons.ice }
            ],
            range: "2m",
            stamina: "1",
            damage: "-",
            duration: "1 hour",
            description: "Creates a faint, blue glow that illuminates the surroundings in a 2m radius around the source. The light requires no heat or air, generates no heat, and cannot ignite anything. The light source follows the Curse Adept for 1 hour before extinguishing.",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Illusion",
            type: "Buff",
            target: "self",
            essenceCost: { Light: 3, Water: 2 },
            essenceTotalCost: 5,
            staminaCost: 1,
            unlockedAtLevel: "1",
            cost: [
                { type: 'light', quantity: 3, iconHtml: essenceIcons.light },
                { type: 'water', quantity: 2, iconHtml: essenceIcons.water }
            ],
            range: "-",
            stamina: "1",
            damage: "-",
            duration: "4 rounds",
            description: "The Curse Adept creates an illusion of their weapon and conceals the actual weapon for 4 rounds. Blocking and dodging are 4 points more difficult for enemies.",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Magnetism",
            type: "Misc.",
            target: "object",
            essenceCost: { Metal: 1 },
            essenceTotalCost: 1,
            staminaCost: 1,
            unlockedAtLevel: "1",
            cost: [
                { type: 'metal', quantity: 1, iconHtml: essenceIcons.metal }
            ],
            range: "-",
            stamina: "1",
            damage: "-",
            duration: "-",
            description: "The character or the target can attract metals. The speed at which the maximum 5kg of metal can move is approximately 3 km/h and cannot cause significant harm.",
            effect: "-",
            thmMultiplier: "-"
        },
                {
        name: "Muddy Ground",
        type: "Misc.",
        target: "area",
        essenceCost: { Earth: 3, Water: 2 },
        essenceTotalCost: 5,
        staminaCost: 1,
        unlockedAtLevel: "1",
        cost: [
            { type: 'earth', quantity: 3, iconHtml: essenceIcons.earth },
            { type: 'water', quantity: 2, iconHtml: essenceIcons.water }
        ],
        range: "-",
        stamina: "1",
        damage: "-",
        duration: "-",
        description: "The caster covers the ground in a cone-shaped area in front of them with a layer of mud that is 0.5m deep. Ineffective if the ground is already made of mud. Mud is considered difficult terrain, and anyone walking on it must pay 1 stamina for every meter they want to move or reduce their movement to a quarter (rounded down).",
        effect: "-",
        thmMultiplier: "-"
    },
    {
        name: "Nerve Shock",
        type: "Debuff",
        target: "enemy",
        essenceCost: { Water: 3, Lightning: 3 },
        essenceTotalCost: 6,
        staminaCost: 2,
        unlockedAtLevel: "1",
        cost: [
            { type: 'water', quantity: 3, iconHtml: essenceIcons.water },
            { type: 'lightning', quantity: 3, iconHtml: essenceIcons.lightning }
        ],
        range: "-",
        stamina: "2",
        damage: "-",
        duration: "2 rounds",
        description: "The caster strikes the target with both essences in hand, which will become Stunned for 2 rounds. (Works only on organic beings)",
        effect: "-",
        thmMultiplier: "-"
    },
    {
        name: "Ore Finder",
        type: "Misc.",
        target: "area",
        essenceCost: { Earth: 2, Metal: 1 },
        essenceTotalCost: 3,
        staminaCost: 1,
        unlockedAtLevel: "1",
        cost: [
            { type: 'earth', quantity: 2, iconHtml: essenceIcons.earth },
            { type: 'metal', quantity: 1, iconHtml: essenceIcons.metal }
        ],
        range: "100m",
        stamina: "1",
        damage: "-",
        duration: "-",
        description: "The caster instinctively knows where the nearest ore vein is (ignores already processed ores and metals). If there is no ore vein within a range of 100m, the caster instead gets a headache and receives a penalty of -2 to social skills for an hour.",
        effect: "-",
        thmMultiplier: "-"
    },
    {
        name: "Sprint",
        type: "Buff",
        target: "self",
        essenceCost: { Wind: 3, Lightning: 1 },
        essenceTotalCost: 4,
        staminaCost: 0,
        unlockedAtLevel: "1",
        cost: [
            { type: 'wind', quantity: 3, iconHtml: essenceIcons.wind },
            { type: 'lightning', quantity: 1, iconHtml: essenceIcons.lightning }
        ],
        range: "-",
        stamina: "0",
        damage: "-",
        duration: "-",
        description: "The caster can run at twice their normal speed in this turn.",
        effect: "-",
        thmMultiplier: "-"
    },
    {
        name: "Stone Shot",
        type: "Attack",
        target: "any",
        essenceCost: { Wind: 1, Earth: 2 },
        essenceTotalCost: 3,
        staminaCost: 1,
        unlockedAtLevel: "1",
        cost: [
            { type: 'wind', quantity: 1, iconHtml: essenceIcons.wind },
            { type: 'earth', quantity: 2, iconHtml: essenceIcons.earth }
        ],
        range: "-",
        stamina: "1",
        damage: "-",
        duration: "-",
        description: "The character shoots approximately 1 kg of rock in any direction of their choosing.",
        effect: "-",
        thmMultiplier: "-"
    },
    {
        name: "Water Ball",
        type: "Attack",
        target: "any",
        essenceCost: { Water: 2 },
        essenceTotalCost: 2,
        staminaCost: 1,
        unlockedAtLevel: "1",
        cost: [
            { type: 'water', quantity: 2, iconHtml: essenceIcons.water }
        ],
        range: "-",
        stamina: "1",
        damage: "-",
        duration: "-",
        description: "The character shapes a small amount of water in their hand, as if forming a snowball, which they can throw or shoot. The caster can choose to have this spell deal no damage.",
        effect: "-",
        thmMultiplier: "-"
    }

    ],
    Conductor: [],
    Tecromancer: [
        {
            name: "",
            unlockedAtLevel: "",
            essenceCost: { Light: 2 },
            essenceTotalCost: 2,
            staminaCost: 1,
            cost: [
                { type: 'light', quantity: 2 }  // Now referencing type and quantity
            ],
            type: "",
            target: "",
            range: "",
            stamina: "",
            damage: "",
            duration: "",
            description: "",
            effect: "",
            thmMultiplier: 1
        },
        {
            name: "Mud Armor",
            type: "Buff",
            target: "self/ally",
            essenceCost: { Earth: 2, Water: 1 },
            essenceTotalCost: 3,
            staminaCost: 1,
            unlockedAtLevel: "1",
            cost: [
                { type: 'earth', quantity: 2, iconHtml: essenceIcons.earth },
                { type: 'water', quantity: 1, iconHtml: essenceIcons.water }
            ],
            range: "-",
            stamina: "1",
            damage: "-",
            duration: "5 minutes",
            description: "The target is cloaked in mud armor. The mud prevents fire damage and hardens, absorbing up to 30 points of damage. The armor is immediately destroyed when receiving water elemental damage but lasts for 5 minutes otherwise. Can be cast once per round at any time.",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Orefinder",
            type: "Misc.",
            target: "self",
            essenceCost: { Earth: 1, Metal: 1 },
            essenceTotalCost: 2,
            staminaCost: 1,
            unlockedAtLevel: "1",
            cost: [
                { type: 'earth', quantity: 1, iconHtml: essenceIcons.earth },
                { type: 'metal', quantity: 1, iconHtml: essenceIcons.metal }
            ],
            range: "100m",
            stamina: "1",
            damage: "-",
            duration: "1 hour",
            description: "The caster knows instinctively where the next ore vein is within a radius of 100m. If there is no ore vein within 100m the caster suffers a severe headache that gives a -2 penalty on all rolls for an hour! This penalty is stackable.",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Overcharged",
            type: "Buff",
            target: "self/ally",
            essenceCost: { Fire: 2, Lightning: 1 },
            essenceTotalCost: 3,
            staminaCost: 3,
            unlockedAtLevel: "1",
            cost: [
                { type: 'fire', quantity: 2, iconHtml: essenceIcons.fire },
                { type: 'lightning', quantity: 1, iconHtml: essenceIcons.lightning }
            ],
            range: "-",
            stamina: "3",
            damage: "-",
            duration: "1 round",
            description: "The caster or their target are filled with energy. They can move twice as far and dodge without spending stamina (max 5 attempts) for 1 round. In the following round, they will not regenerate stamina.",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Portal",
            type: "Misc.",
            target: "area",
            essenceCost: { Wind: 4, Cosmic: 1 },
            essenceTotalCost: 5,
            staminaCost: 1,
            unlockedAtLevel: "1",
            cost: [
                { type: 'wind', quantity: 4, iconHtml: essenceIcons.wind },
                { type: 'cosmic', quantity: 1, iconHtml: essenceIcons.cosmic }
            ],
            range: "20m",
            stamina: "1",
            damage: "-",
            duration: "4 minutes",
            description: "The Elementalist creates two portals for 4 minutes that are at most 20 m apart from each other. The caster has to be able to see both locations where the portals should be placed. If the portal closes while someone or something is passing through, they or it will be violently ejected into either direction.",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Reinforce",
            type: "Buff",
            target: "ally/object",
            essenceCost: { Wind: 2, Metal: 1 },
            essenceTotalCost: 3,
            staminaCost: 1,
            unlockedAtLevel: "1",
            cost: [
                { type: 'wind', quantity: 2, iconHtml: essenceIcons.wind },
                { type: 'metal', quantity: 1, iconHtml: essenceIcons.metal }
            ],
            range: "-",
            stamina: "1",
            damage: "-",
            duration: "3 rounds",
            description: "The Elementalist reinforces an object or ally for 3 rounds. Reinforced objects cannot be broken, except through the use of very excessive force, while allies gain +4 DEF.",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Rock Shield",
            type: "Buff",
            target: "self/ally",
            essenceCost: { Earth: 2 },
            essenceTotalCost: 2,
            staminaCost: 1,
            unlockedAtLevel: "1",
            cost: [
                { type: 'earth', quantity: 2, iconHtml: essenceIcons.earth }
            ],
            range: "-",
            stamina: "1",
            damage: "-",
            duration: "1 round",
            description: "Creates a small, floating stone plate around a target that blocks up to 15 physical damage and lasts for 1 round. Can be cast once per round at any time.",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Spit Shine",
            type: "Misc.",
            target: "any",
            essenceCost: { Water: 1, Metal: 1 },
            essenceTotalCost: 2,
            staminaCost: 1,
            unlockedAtLevel: "1",
            cost: [
                { type: 'water', quantity: 1, iconHtml: essenceIcons.water },
                { type: 'metal', quantity: 1, iconHtml: essenceIcons.metal }
            ],
            range: "1m",
            stamina: "1",
            damage: "-",
            duration: "-",
            description: "Removes dirt, rust, blood, poison and other impurities from the surface of a metal object. Range 1m, can only be cast on objects that don’t touch the caster.",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Steadfast",
            type: "Buff",
            target: "self/ally",
            essenceCost: { Wind: 2, Earth: 2 },
            essenceTotalCost: 4,
            staminaCost: 1,
            unlockedAtLevel: "1",
            cost: [
                { type: 'wind', quantity: 2, iconHtml: essenceIcons.wind },
                { type: 'earth', quantity: 2, iconHtml: essenceIcons.earth }
            ],
            range: "-",
            stamina: "1",
            damage: "-",
            duration: "-",
            description: "The Elementalist reinforces a target so it can no longer be Toppled or Stunned.",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Transfer",
            type: "Misc.",
            target: "ally",
            essenceCost: { Ice: 1, Fire: 1, Lightning: 1 },
            essenceTotalCost: 3,
            staminaCost: 0,
            unlockedAtLevel: "1",
            cost: [
                { type: 'ice', quantity: 1, iconHtml: essenceIcons.ice },
                { type: 'fire', quantity: 1, iconHtml: essenceIcons.fire },
                { type: 'lightning', quantity: 1, iconHtml: essenceIcons.lightning }
            ],
            range: "-",
            stamina: "0",
            damage: "-",
            duration: "-",
            description: "The caster transfers their entire stamina to a target. The target cannot gain stamina over their maximum capacity and excess stamina will be lost.",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Warm Wind",
            type: "Misc.",
            target: "self/ally",
            essenceCost: { Wind: 1, Fire: 1 },
            essenceTotalCost: 2,
            staminaCost: 1,
            unlockedAtLevel: "1",
            cost: [
                { type: 'wind', quantity: 1, iconHtml: essenceIcons.wind },
                { type: 'fire', quantity: 1, iconHtml: essenceIcons.fire }
            ],
            range: "-",
            stamina: "1",
            damage: "-",
            duration: "20 minutes",
            description: "The Elementalist or a target ally becomes surrounded by a shell of warm air for 20 minutes that prevents Cold and Hypothermia. Cannot be cast in places without air.",
            effect: "-",
            thmMultiplier: "-"
        },
        {
            name: "Watershell",
            type: "Buff",
            target: "self/ally",
            essenceCost: { Water: 3 },
            essenceTotalCost: 3,
            staminaCost: 1,
            unlockedAtLevel: "1",
            cost: [
                { type: 'water', quantity: 3, iconHtml: essenceIcons.water }
            ],
            range: "-",
            stamina: "1",
            damage: "-",
            duration: "3 hits or 3 minutes",
            description: "The Elementalist surrounds their target with a shield of water that protects it from formless attacks like natural fire, spores, small projectiles, sprayed fluids, etc., and blocks any effects connected to them. The shield lasts for 3 hits (incoming OR outgoing!) in battle and for 3 minutes outside of battle.",
            effect: "-",
            thmMultiplier: "-"
        },
    ]
}; // Global variable to store spells based on class

function updateSpellsTable() {
    var classSelection = document.getElementById('classSelection').value;
    var spells = globalSpells[classSelection] || [];

    document.querySelectorAll('.tabcontent').forEach(tc => tc.innerHTML = '');

    spells.forEach(spell => {
        var tabContent = document.getElementById(spell.type);
        if (!tabContent) {
            createTab(spell.type);
            tabContent = document.getElementById(spell.type);
        }

        var div = document.createElement('div');
        div.className = 'spell';

        var costHTML = spell.cost.map(costItem => {
            let iconHtml = essenceIcons[costItem.type] || '';
            return `${costItem.quantity}x ${iconHtml}`;
        }).join(' ');

        var detailsDiv = document.createElement('div');
        detailsDiv.className = 'spell-details';
        detailsDiv.style.display = 'none';  // Initially hide details

        div.innerHTML = `
            <strong>${spell.name} (Level: ${spell.unlockedAtLevel})</strong>
            <label><input type="checkbox" class="learned-checkbox" onchange="toggleSpellDetails(this)"> Learned</label>
        `;

        // Add a button for casting the spell, only visible when details are shown
        var castButton = document.createElement('button');
        castButton.textContent = 'Cast Spell';
        castButton.onclick = function() { castSpell(spell.name); };
        castButton.style.display = 'block';  // Ensure the button is block level

        detailsDiv.innerHTML = `
            <span class="spell-cost">${costHTML} | ${staminaIcon} x${spell.staminaCost}</span>
            <p>Target: ${spell.target}, Range: ${spell.range}</p>
            <p>Description: ${spell.description}</p>
        `;
        detailsDiv.appendChild(castButton);

        div.appendChild(detailsDiv);
        tabContent.appendChild(div);
    });

    if (spells.length > 0) {
        document.querySelector('.tablinks').click();
    }
}

function toggleSpellDetails(checkbox) {
    var detailsDiv = checkbox.closest('.spell').querySelector('.spell-details');
    if (checkbox.checked) {
        detailsDiv.style.display = 'block';
    } else {
        detailsDiv.style.display = 'none';
    }
}

function createTab(typeName) {
    // Create tab link
    var tabLink = document.createElement('button');
    tabLink.className = 'tablinks';
    tabLink.textContent = typeName;
    tabLink.setAttribute('onclick', `openTab(event, '${typeName}')`);
    document.querySelector('.tab').appendChild(tabLink);

    // Create tab content
    var tabContent = document.createElement('div');
    tabContent.id = typeName;
    tabContent.className = 'tabcontent';
    document.querySelector('.spells-section').appendChild(tabContent);
}

function openTab(evt, typeName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(typeName).style.display = "block";
    evt.currentTarget.className += " active";
}

function castSpell(spellName) {
    const classSelection = document.getElementById('classSelection').value;
    const spell = globalSpells[classSelection].find(s => s.name === spellName);
    if (!spell) {
        showToast("Spell not found.");
        return;
    }

    // Check and deduct essences
    let essenceSufficient = true;
    Object.keys(spell.essenceCost).forEach(essence => {
        const essenceElement = document.getElementById(essence.toLowerCase() + 'Essence');
        if (essenceElement && essenceElement.value < spell.essenceCost[essence]) {
            essenceSufficient = false;
            showToast(`Insufficient ${essence} essence.`);
        } else if (essenceElement) {
            essenceElement.value -= spell.essenceCost[essence];
        }
    });

    // Check for total essence capacity
    const totalEssenceElement = document.getElementById('cepr');
    if (totalEssenceElement.value < spell.essenceTotalCost) {
        showToast("Insufficient essence available this round.");
        return;
    }

    // Deduct stamina
    const staminaElement = document.getElementById('stam');
    if (staminaElement.value < spell.staminaCost) {
        showToast("Insufficient stamina.");
        return;
    }

    if (essenceSufficient) {
        staminaElement.value -= spell.staminaCost;
        totalEssenceElement.value -= spell.essenceTotalCost;

        if (spell.damage) {
            const totalDamage = calculateSpellDamage(spell.damage, spell.thmMultiplier);
            showToast(`Casted ${spell.name}! Damage: ${totalDamage}. ${spell.effect}`);
        } else {
            showToast(`Casted ${spell.name}! ${spell.effect}`);
        }
    }
}

function calculateSpellDamage(damageNotation, thmMultiplier = 1) {
    const parts = damageNotation.match(/(\d+)D(\d+)/i);
    if (!parts) return 0;

    const diceCount = parseInt(parts[1], 10);
    const diceType = parseInt(parts[2], 10);
    const thmValue = parseInt(document.getElementById('thm').value, 10) || 0;

    let totalDamage = 0;
    for (let i = 0; i < diceCount; i++) {
        totalDamage += Math.floor(Math.random() * diceType) + 1;
    }

    totalDamage += Math.floor(thmValue * thmMultiplier); // Apply THM multiplier
    return totalDamage;
}

function getBase64Image(imgElement) {
    const canvas = document.createElement("canvas");
    canvas.width = imgElement.width;
    canvas.height = imgElement.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(imgElement, 0, 0);
    const dataURL = canvas.toDataURL("image/png");
    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}

function openTraitInfo(traitId) {
    const selectElement = document.getElementById(traitId);
    const traitValue = selectElement.value;
    console.log("Trait ID:", traitId); // Debug output
    console.log("Selected Trait Value:", traitValue); // Debug output

    if (traitValue === "") {
        showToast("Please select a trait to learn more.");
    } else {
        const description = traitDescriptions[traitValue] || "No description available for this trait.";
        showToast(description);
    }
}

function normalizeTraitName(trait) {
    return trait.split(' ').map((word, index) => index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('');
}

const traitDescriptions = {
    //positive traits
    agileSwimmer: "+2 bonus to Swimming. Your character is a strong and agile swimmer, able to navigate through open water with ease.",
    animalFriend: "+2 bonus to Zoology. The character is great at identifying, handling and befriending animals.",
    benevolent: "+2 bonus to Empathy. Your character only wishes the best to happen to others and can identify emotional distress easily.",
    bullsBulk: "+2 bonus to Intimidation. Your character appears to be particularly muscular and threatening, regardless of actual strength and fitness.",
    enchantingPerformer: "+2 bonus to Singing and Dancing. Your character is a captivating singer and dancer, able to mesmerize and entertain audiences with their talent.",
    gardener: "+2 Bonus to Botany. Your character not only knows how to correctly identify plants and what conditions are necessary to grow them.",
    goodSenseOfDirection: "+2 bonus to Orientation. Your character has an innate sense of direction, rarely getting lost in unfamiliar places.",
    keenObserver: " +2 bonus to Perception. Your character has sharp senses and can notice even the smallest details in their surroundings.",
    masterTrapper: "+2 bonus to Trapping. Your character is skilled at setting traps and catching prey, making them a formidable hunter.",
    naturalLeader: "+2 bonus to Leadership. Your character has a commanding presence and the ability to inspire and lead others in challenging situations.",
    naturesBounty: "+2 bonus to Foraging. Your character has a keen sense of where to find food and sources of fresh water in the wilderness.",
    naturesLore: "+2 bonus to Botany and Zoology. Your character possesses extensive knowledge of plants and animals, making them an expert in identifying and handling wildlife.",
    silverTongue: "+2 bonus to Speech. Your character has a gift for eloquent speech and persuasion. They have a natural charm that makes it easier to convince others to see things their way.",
    skilledRider: "+2 bonus to Riding. Your character is adept at riding animals and controlling various means of transportation.",
    softstepper: "+2 bonus to Sneaking. Your character has developed a personality trait that makes them want to walk as quietly as possible, in public and in private.",
    treasureHunter: "+3 bonus on finding items that are not essences, food or other consumables when foraging. Your character has an innate sense of finding valuables (valuable is dependent on the characters point of view).",
    wallLatcher: "+2 bonus on Climbing. Your character is great at climbing and latches onto climbable walls like it’s second nature.",
    //negative traits
    aimless: "-2 penalty to Orientation. The character has trouble orienting without proper signage or similar indicators and has a bad memory when it comes to following directions.",
    allergic: "-2 penalty to Botany and Zoology. Your character is prone to allergic reactions when handling certain animals or being around certain plants.",
    aloof: "-2 penalty to Empathy. Your character struggles to connect with others on an emotional level, making it difficult for them to empathize with or comfort others.",
    badSwimmer: " -2 penalty to Swimming.  Your character’s swimstyle of choice is 'The leaden duck'. ",
    brashBehavior: "-2 penalty to Speech and Leadership. Your character tends to be overly aggressive and intimidating, often resorting to force to get their way.",
    clumsySneaker: "-2 penalty to Sneaking. Your character is not very stealthy and tends to make noise or leave traces when trying to sneak around.",
    fearOfHeights: "-2 penalty to Climbing.  Your character is afraid of heights, making it difficult for them to climb obstacles or scale heights.",
    flimsyConstruction: "-2 penalty to Trapping.  Your character has trouble constructing a sturdy trap and often fails at catching prey. ",
    fumblingForager: "-2 penalty to Foraging. Your character struggles to find food and resources in the wild, often overlooking valuable sources of sustenance.",
    gluttonous: "Your character requires twice the rations as any other character without the trait (of the same species). Your character is virtually always hungry.",
    gullible: "On each Speech roll that involves the character being told an obvious lie, the character gets a -4 penalty. The character is easy to trick and manipulate, believing most lies that are obvious to others.",
    ironGraterVoice: "-3 penalty to Speech, Leadership, Singing and Dancing, +5 bonus to Intimidation. Your character's voice has the acoustic qualities of fingernails on a chalkboard and people will do their best to stop them from talking.",
    kleptomaniac: "Every time your character gets the chance, they have the desire to steal an object (Roll a D10 and roll >10 to resist stealing). This can be highly detrimental, depending on your surroundings. Your character has a constant desire to collect or steal something, thinking it is theirs already.",
    marshmallowy: "-2 penalty to Intimidation. Your character appears non-threatening in physique and gesture and has to try extra hard if they want to look intimidating.",
    mutteringNonsense: "-2 penalty to Speech. Your character spouts random nonsense between sentences and often tries to change the meaning of their previous statements or to deny them altogether, which makes it hard to believe anything they say.",
    oblivious: "-2 penalty to Perception. Your character does not register most of the less obvious elements in their surroundings.",
    paleThumb: "-2 penalty to Botany. Your character has the remarkable ability to not be able to raise any sort of plant. Even cacti wilt and wither within a week under their care.",
    reluctantEntertainer: "-2 penalty to Singing and Dancing. Your character does not like entertaining others and never practiced it more than necessary for their cultural upbringing.",
    shy: "-2 penalty to Leadership. Your character is very uncomfortable to speak to crowds.",
    trade0Maniac: "When given the chance, you have to steal an item (Roll higher than 10 on a D20 to resist stealing) and leave something that you would consider a “fair trade”. Your character has the constant desire to trade items. Consent of the other party is not a factor that matters.",
    unluckyFinder: "A failed Foraging check will always yield unwanted results, like finding the egg of a very protective and aggressive bird species. Your character will always find “something” when foraging and will not experience failure in the traditional sense.",
    unqualifiedToRide: "-2 penalty to Riding. Your character is inept at riding animals or steering vehicles.",
    //strong positive traits
    Acrobat: "After any failed dodge attempt, the character may perform one additional dodge attempt for 1 stamina or a free block attempt. This ability can not be used more than once per attack. The character gets a bonus of +2 on Climbing, Sneaking and Riding checks. The character is incredibly flexible and nimble and can adapt to almost any position they find themself in.",
    Agile: "Increases Stamina regeneration rate by 1. Increases movement speed by 2m. The character is light on their feet and possesses exceptional stamina, allowing them to act quickly and with greater endurance.",
    ArcaneShield: "Doubles the characters Magic Defense at all times. The character can use their own magic defense to protect partymembers within 20m. The character can protect party members with their own arcane barriers.",
    ElementalMastery: "Choose any element when gaining this trait (Wind, Water, Fire, Earth, Ice, Metal, Light, Lightning, Cosmic). All spells that use this element deal 20% more damage. This trait can't be chosen with the Dynamist class. If Thaumaturgy is >15: All spells that use this element cost 1 essence less of this element (cost can't become 0, cosmic essence is excluded from this rule)",
    Evasive: "When dodging, the character can expend 3 stamina instead of 2 to dodge all attacks of a single enemy with just one successful dodge. This automatically disengages the enemy. The Character is incredibly skilled at predicting enemy movements and is fast enough to dodge them.",
    ExplosiveSpeed: "The character starts every battle with 2 additional points of stamina and can move 5m more during the first round. (If Fitness is >15: The character starts every battle with 3 additional points of stamina instead.) The character is incredibly motivated to charge headfirst into battle and has a metaphorical spring in their step to do so.",
    Juggernaut: "Difficult terrain only reduces movement by 2m. Durations for stunned, vulnerable or toppled on this character can't exceed 1 round and cannot be applied in two consecutive turns. (If Vitality is >15: The character can't be stunned or knocked vulnerable.) The character fights and moves like an unstoppable force of nature.",
    //Marathoner: "To be added",
    PreciseCaster: "",
    VibrantLifeForce: "",

    //strong negative traits
    ArcaneInept: "Decreases spell damage by 10%. Increases all incoming magical damage by 5. Reduces the essence per turn by 1. The character struggles to grasp the complexities of magic, resulting in weaker spellcasting and an inability to manipulate multiple essences effectively.",
    Frail: "Decreases maximum Health by 10%. Increases all incoming physical damage by 5. The character's constitution is delicate, making them more susceptible to harm from physical attacks.",
    Sluggish: "Decreases Stamina regeneration rate by 1. Decreases movement speed by 2m. The character lacks physical agility and tires quickly, resulting in slower movements and reduced stamina recovery.",
    UnwiseCaster: "All buffs and debuffs you cast last 1 turn less (can never reach 0 turns) All spell ranges are decreased by 20% The first spell the character casts in their turn requires 1 more essence of each type (except cosmic). The character casts their spells spontaneously and without much thought, wasting a lot of potential.",
};

const positiveTraits = ['Agile Swimmer', 'Animal Friend', 'Benevolent', 'Bulls Bulk', 'Enchanting Performer', 'Gardener', 'Good Sense of Direction', 'Keen Observer', 'Master Trapper', 'Natural Leader', 'Natures Bounty', 'Natures Lore', 'SilverTongue', 'Skilled Rider', 'Softstepper', 'Treasure Hunter', 'Wall Latcher'];
const negativeTraits = ['Aimless', 'Allergic', 'Aloof', 'Bad Swimmer', 'Brash Behavior', 'Clumsy Sneaker', 'Fear of Heights', 'Flimsy Construction', 'Fumbling Forager', 'Gluttonous', 'Gullible', 'Iron Grater Voice', 'Kleptomaniac', 'Marshmallowy', 'Muttering Nonsense', 'Oblivious', 'Pale Thumb', 'Reluctant Entertainer', 'Short Temper', 'Shy', 'Trade0Maniac', 'Unlucky Finder', 'Unqualified Rider'];
const strongPositiveTraits = ['Acrobat', 'Agile', 'Arcane Shield', 'Elemental Mastery', 'Evasive', 'Explosive Speed', 'Juggernaut', 'Marathoner', 'Precise Caster', 'Vibrant Life Force']; // Example strong positive traits
const strongNegativeTraits = ['Arcane Inept', 'Frail', 'Sluggish', 'Unwise Caster']; // Example strong negative traits

function populateTraits() {
    const posContainer = document.getElementById('positiveTraits');
    const negContainer = document.getElementById('negativeTraits');

    posContainer.innerHTML = '';
    negContainer.innerHTML = '';

    function createTraitSelect(traits, idPrefix, count, isStrong = false) {
        let startIndex = isStrong ? 0 : 1;
        for (let i = startIndex; i < startIndex + count; i++) {
            const select = document.createElement('select');
            select.id = `${idPrefix}Trait${i + (isStrong ? 'Strong' : '')}`;
            select.innerHTML = `<option value="">Select a Trait</option>`;
            traits.forEach(trait => {
                const normalizedTrait = normalizeTraitName(trait);
                select.innerHTML += `<option value="${normalizedTrait}">${trait}</option>`;
            });

            const button = document.createElement('button');
            button.textContent = 'Learn More';
            button.dataset.selectId = select.id;
            button.addEventListener('click', function() {
                openTraitInfo(this.dataset.selectId);
            });

            const div = document.createElement('div');
            div.className = 'traits';
            if (isStrong) {
                div.classList.add('strong-trait');
            }
            div.appendChild(select);
            div.appendChild(button);

            const container = (idPrefix === 'positive') ? posContainer : negContainer;
            container.appendChild(div);
        }
    }

    createTraitSelect(strongPositiveTraits, 'positive', 1, true);
    createTraitSelect(positiveTraits, 'positive', 5);
    createTraitSelect(strongNegativeTraits, 'negative', 1, true);
    createTraitSelect(negativeTraits, 'negative', 5);
}

document.addEventListener('DOMContentLoaded', populateTraits);

function saveFormData() {
    const data = {
        inputs: {},
        selects: {},
        checkboxes: {},
        weapons: [],
        inventory: [],
        skills: {},
        buffs: [],
        ailments: [],
        spellsClass: document.getElementById('classSelection').value,
        spells: [],
        armor: {
            head: {
                name: document.getElementById('headName').value,
                def: document.getElementById('headDEF').value,
                mdef: document.getElementById('headMDEF').value
            },
            body: {
                name: document.getElementById('bodyName').value,
                def: document.getElementById('bodyDEF').value,
                mdef: document.getElementById('bodyMDEF').value
            },
            arms: {
                name: document.getElementById('armsName').value,
                def: document.getElementById('armsDEF').value,
                mdef: document.getElementById('armsMDEF').value
            },
            legs: {
                name: document.getElementById('legsName').value,
                def: document.getElementById('legsDEF').value,
                mdef: document.getElementById('legsMDEF').value
            },
            feet: {
                name: document.getElementById('feetName').value,
                def: document.getElementById('feetDEF').value,
                mdef: document.getElementById('feetMDEF').value
            }
        },
        abilities: []
    };

    // Save input, select, and checkbox states
    document.querySelectorAll('input[type="text"], input[type="number"], select, input[type="checkbox"]').forEach(element => {
        const key = element.name || element.id;
        const value = element.type === 'checkbox' ? element.checked : element.value;
        if (element.tagName === 'SELECT') {
            data.selects[key] = value;
        } else if (element.type === 'checkbox') {
            data.checkboxes[key] = value;
        } else {
            data.inputs[key] = value;
        }
    });

    // Save buffs
    document.querySelectorAll('.buff-entry').forEach(buffEntry => {
        const buffDropdown = buffEntry.querySelector('.buff-dropdown');
        const durationInput = buffEntry.querySelector('input[type="number"]');
        data.buffs.push({
            buffName: buffDropdown.value,
            duration: durationInput.value
        });
    });

    // Save weapons
    document.querySelectorAll('.weapon').forEach(weapon => {
        const weaponId = weapon.id.replace('weapon', '');
        const name = document.getElementById(`name${weaponId}`).value;
        const weaponType = document.getElementById(`weaponType${weaponId}`).value;
        const diceNumber = document.getElementById(`diceNumber${weaponId}`).value;
        const diceType = document.getElementById(`diceType${weaponId}`).value;
        const baseDamage = document.getElementById(`baseDamage${weaponId}`).value;
        data.weapons.push({
            name,
            type: weaponType,
            diceNumber,
            diceType,
            baseDamage
        });
    });

    // Save inventory
    document.querySelectorAll('.inventory-table tbody tr').forEach(row => {
        const itemInputs = row.querySelectorAll('.item-input');
        const amountInputs = row.querySelectorAll('.amount-input');
        data.inventory.push({
            item1: itemInputs[0].value,
            amount1: amountInputs[0].value,
            item2: itemInputs[1].value,
            amount2: amountInputs[1].value
        });
    });

    // Save skills
    document.querySelectorAll('.skills-table input[type="number"]').forEach(input => {
        data.skills[input.name] = input.value;
    });

    // Save spells
    document.querySelectorAll('#spellsTable tbody tr').forEach(row => {
        const spellName = row.querySelector('td:first-child').textContent;
        const learned = row.querySelector('input[type="checkbox"]').checked;
        data.spells.push({
            name: spellName,
            learned: learned
        });
    });

        // Save spells
    data.spells = [];
    document.querySelectorAll('.spell').forEach(spellDiv => {
        const spellName = spellDiv.querySelector('strong').textContent.split(' (')[0]; // Assuming name and level are within strong and separated by ' ('
        const learnedCheckbox = spellDiv.querySelector('.learned-checkbox');
        if (learnedCheckbox) {
            data.spells.push({
                name: spellName,
                learned: learnedCheckbox.checked
            });
        }
    });


    // Save positive and negative traits
    data.positiveTraits = [];
    data.negativeTraits = [];

    document.querySelectorAll('#positiveTraits select').forEach(select => {
        data.positiveTraits.push(select.value);
    });
    document.querySelectorAll('#negativeTraits select').forEach(select => {
        data.negativeTraits.push(select.value);
    });


    // Save abilities
    document.querySelectorAll('.abilities-section .weapon-ability-select').forEach((select, index) => {
        const weaponAbility = select.value;
        const additionalSelect = document.querySelector(`.additional-ability-select[data-level="${index + 1}"]`);
        const additionalAbility = additionalSelect ? additionalSelect.value : '';
        data.abilities.push({
            level: index + 1,
            weaponAbility: weaponAbility,
            additionalAbility: additionalAbility
        });
    });

    // Save ailments
    document.querySelectorAll('.ailment-checkbox').forEach((checkbox, index) => {
        data.ailments.push({
            name: checkbox.dataset.name,
            affected: checkbox.checked
        });
    });

    const dataStr = JSON.stringify(data);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'characterData.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

function loadFormData() {
    const fileInput = document.getElementById('fileInput');
    if (!fileInput.files || fileInput.files.length === 0) {
        alert("No file selected!");
        return;
    }

    const file = fileInput.files[0];
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        try {
            const textFromFileLoaded = event.target.result;
            const data = JSON.parse(textFromFileLoaded);

            // Set all inputs, selects, and checkboxes as before
            Object.keys(data.inputs).forEach(key => {
                const element = document.querySelector(`input[name="${key}"], input[id="${key}"]`);
                if (element) element.value = data.inputs[key];
            });

            Object.keys(data.selects).forEach(key => {
                const element = document.querySelector(`select[name="${key}"]`);
                if (element) element.value = data.selects[key];
            });

            Object.keys(data.checkboxes).forEach(key => {
                const element = document.querySelector(`input[name="${key}"]`);
                if (element) element.checked = data.checkboxes[key];
            });

            // First ensure Vitality is set correctly, then calculate Max HP
            const vitInput = document.getElementById('vit');
            if (vitInput && data.inputs.vit !== undefined) {
                vitInput.value = data.inputs.vit;
                calculateMaxHP();  // This recalculates and sets maxHP based on new Vitality
            }

            // Then set HP and update HP bar accordingly
            const hpInput = document.getElementById('hp');
            const maxHpInput = document.getElementById('maxHP');
            if (hpInput && maxHpInput && data.inputs.hp !== undefined) {
                hpInput.value = data.inputs.hp;
                updateHPBar(hpInput.value, maxHpInput.value);
            }

                    // Load ailment states
            data.ailments.forEach((ailment, index) => {
            const checkbox = document.getElementById(`ailment${index}`);
            if (checkbox) {
                checkbox.checked = ailment.affected;
            }
            });

            const buffsContainer = document.getElementById('buff-list');
            buffsContainer.innerHTML = '';
            data.buffs.forEach(buffData => {
                const buffEntry = document.createElement('div');
                buffEntry.className = 'buff-entry';

                const buffDropdown = document.createElement('select');
                buffDropdown.className = 'buff-dropdown';
                const options = ['Choose a Buff', 'Sprint', 'Buff 2', 'Buff 3'];
                options.forEach(option => {
                    const opt = document.createElement('option');
                    opt.value = option;
                    opt.innerHTML = option;
                    buffDropdown.appendChild(opt);
                });
                buffDropdown.value = buffData.buffName;

                const descriptionBox = document.createElement('div');
                descriptionBox.className = 'buff-description';
                descriptionBox.textContent = buffDescriptions[buffData.buffName] || 'Select a buff to see its description';

                const durationInput = document.createElement('input');
                durationInput.type = 'number';
                durationInput.value = buffData.duration;
                durationInput.min = 1;

                buffEntry.appendChild(buffDropdown);
                buffEntry.appendChild(durationInput);
                buffEntry.appendChild(descriptionBox);
                buffsContainer.appendChild(buffEntry);
            });

            const weaponsContainer = document.getElementById('weapons-container');
            weaponsContainer.innerHTML = '';
            data.weapons.forEach(weapon => {
                addWeapon(weapon);
            });

            const inventoryTable = document.querySelector('.inventory-table tbody');
            inventoryTable.innerHTML = '';
            data.inventory.forEach(item => {
                const row = inventoryTable.insertRow();
                row.innerHTML = `<td><input type="text" class="item-input" value="${item.item1}"></td>
                    <td><input type="text" class="amount-input" value="${item.amount1}"></td>
                    <td><input type="text" class="item-input" value="${item.item2}"></td>
                    <td><input type="text" class="amount-input" value="${item.amount2}"></td>`;
            });

            Object.keys(data.skills).forEach(skill => {
                const input = document.querySelector(`input[name="${skill}"]`);
                if (input) input.value = data.skills[skill];
            });

            const classSelect = document.getElementById('classSelection');
            if (classSelect) {
                classSelect.value = data.spellsClass;
                updateSpellsTable();
            }

            data.spells.forEach(spellData => {
                const spellRow = document.querySelector(`tr[data-spell="${spellData.name}"]`);
                if (spellRow) {
                    const checkbox = spellRow.querySelector('input[type="checkbox"]');
                    if (checkbox) checkbox.checked = spellData.learned;
                    toggleSpellDetails(spellData.name, spellData.learned);
                }
            });

            // Load spells
            data.spells.forEach(spellData => {
                document.querySelectorAll('.spell').forEach(spellDiv => {
                    const spellName = spellDiv.querySelector('strong').textContent.split(' (')[0];
                    if (spellName === spellData.name) {
                        const learnedCheckbox = spellDiv.querySelector('.learned-checkbox');
                        if (learnedCheckbox) {
                            learnedCheckbox.checked = spellData.learned;
                            toggleSpellDetails(learnedCheckbox); // Call to update display based on checkbox state
                        }
                    }
                });
            });

            // Load positive and negative traits
            document.querySelectorAll('#positiveTraits select').forEach((select, index) => {
                select.value = data.positiveTraits[index];
            });
            document.querySelectorAll('#negativeTraits select').forEach((select, index) => {
                select.value = data.negativeTraits[index];
            });

            
            // Restore abilities
            data.abilities.forEach(ability => {
                if (ability.weaponAbility) {
                    const weaponSelect = document.querySelector(`.weapon-ability-select[data-level="${ability.level}"]`);
                    if (weaponSelect) {
                        weaponSelect.value = ability.weaponAbility;
                    }
                }
                if (ability.additionalAbility) {
                    const additionalSelect = document.querySelector(`.additional-ability-select[data-level="${ability.level}"]`);
                    if (additionalSelect) {
                        additionalSelect.value = ability.additionalAbility;
                    }
                }
            });

            Object.keys(data.armor).forEach(part => {
                document.getElementById(`${part}Name`).value = data.armor[part].name;
                document.getElementById(`${part}DEF`).value = data.armor[part].def;
                document.getElementById(`${part}MDEF`).value = data.armor[part].mdef;
            });
        } catch (error) {
            console.error("Error loading data:", error);
            alert("Error loading data. Please check the file format.");
        }
    };

    fileReader.onerror = function() {
        console.error("Error reading the file");
        alert("Failed to read the file.");
    };

    fileReader.readAsText(file, "UTF-8");
}