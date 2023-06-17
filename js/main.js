// =========================
//   Damage Calculation
// =========================
// Calculate damage after blocking or with armour
function CalculateDamage(armour, damage) {
    var reduction = 0;
    if (armour < damage / 2) {
        reduction = (damage - armour) / damage;
    } else {
        reduction = damage / (armour * 4);
    }
    return (reduction * damage).toFixed(2);
}

// Updates the damage and block damage when values are changed
function UpdateValues() {
    var health = parseInt(document.getElementById("health").innerText);
    var armour = parseInt(document.getElementById("armour").value);
    var block = parseInt(document.getElementById("block_armour").value);
    var damage = parseInt(document.getElementById("damage").value);

    var stagger_meter = health * 0.4;

    var unblocked_damage = CalculateDamage(armour, damage);
    document.getElementById("unblocked_damage").innerText =
        unblocked_damage;
    document.getElementById("unblocked_stagger").innerText = Math.min(
        100,
        (1 - (stagger_meter - unblocked_damage) / stagger_meter) * 100
    ).toFixed(2);

    // Calculate blocking damage
    var block_damage = CalculateDamage(block, damage);
    if (stagger_meter < block_damage) {
        document.getElementById("blocked_damage").innerText = "Block failed.";
        document.getElementById("blocked_stagger").innerText = 100;
    } else {
        stagger_meter -= block_damage;
        var remaining_damage = CalculateDamage(armour, block_damage);
        document.getElementById("blocked_damage").innerText =
            remaining_damage;
        document.getElementById("blocked_stagger").innerText = Math.min(100,
            (1 - (stagger_meter - remaining_damage) / stagger_meter) *
            100
        ).toFixed(2);

    }
    document.getElementById("stamina_drain").innerText = (
        (30 * Math.min(block, damage)) /
        block
    ).toFixed(2);
}
// =========================
// Dynamic Table Functions
// =========================
function SetArmourTable(tier) {
    var table = document.getElementById("armour_table");
    table.innerHTML = "";

    armours.forEach((armour_set) => {
        var armour = armour_set.armour + 2 * Math.min(tier, armour_set.tiers);
        var row = document.createElement("tr");
        row.innerHTML = `<td> ${armour_set.name} </td>
                               <td>${armour}</td>`;

        table.append(row);
    });
}
function SetShieldsTable(tier) {
    var table = document.getElementById("shields_table");
    table.innerHTML = "";
    shields.forEach((shield) => {
        var block_armour = shield.armour + 6 * Math.min(tier, shield.tiers);
        var row = document.createElement("tr");
        row.innerHTML = `<td>${shield.name}</td>
              <td>${block_armour}</td>
              <td>${block_armour * shield.parry}</td>
              `;

        table.append(row);
    });
}
function SetCreaturesTable(stars) {
    var table = document.getElementById("creatures_table");
    table.innerHTML = "";
    creatures.forEach((creature) => {
        var row = document.createElement("tr");
        row.innerHTML = `
              <td>${creature.name}</td>
              <td>${creature.hp + creature.hp * stars}</td>
              <td>${creature.damage + creature.damage * 0.5 * stars}</td>
              <td>${creature.weakness}</td>
              <td>${creature.resists}</td>
              `;
        table.append(row);
    });
}
function SetFoodTable() {
    var table = document.getElementById("food_table");
    table.innerHTML = "";
    foods.forEach((food) => {
        var row = document.createElement("tr");
        row.innerHTML = `
          <td>${food.name}</td>
          <td>${food.hp}</td>
          <td>${food.stamina}</td>
          <td>${food.ingredients}</td>
          <td>${food.station}</td>
          `;
        table.append(row);
    });
}
// =========================
// Update form data
// =========================
function UpdateArmourValue() {
    var armour_value = document.getElementById("armour");
    var total_armour = 0;
    var fields = ["head_armour", "body_armour", "leg_armour"];
    var tiers = ["head_tier", "body_tier", "leg_tier"];
    for (var i = 0; i < 3; i += 1) {
        var name = document.getElementById(fields[i]).value;
        if (name == "") continue

        var armour_set = armours.find((item) => item.name == name);
        var tier = document.getElementById(tiers[i]).value;

        total_armour +=
            armour_set.armour + 2 * Math.min(tier, armour_set.tiers);
    }
    armour_value.value = total_armour;
    UpdateValues();
}
function UpdateBlockArmourValue() {
    var block_armour = document.getElementById("block_armour");

    var name = document.getElementById("shield_equipped").value;
    if (name == "") {
        block_armour.value = 0
        return
    }
    var shield = shields.find((item) => item.name == name);
    var tier = document.getElementById("shield_tier_equipped").value;

    var parry = document.getElementById("parry").checked;

    if (parry) {
        block_armour.value =
            (shield.armour + 6 * Math.min(tier, shield.tiers)) * shield.parry;
    } else {
        block_armour.value = shield.armour + 6 * Math.min(tier, shield.tiers);
    }

    UpdateValues();
}
function UpdateCreatureDamageValue() {
    var damage = document.getElementById("damage");
    var name = document.getElementById("creature_selected").value;
    if (name == "") {
        damage.value = 0
        return
    }
    var creature = creatures.find((item) => item.name == name);
    var stars = document.getElementById("creature_stars").value;

    damage.value = creature.damage + creature.damage * 0.5 * stars;
    UpdateValues();
}
function UpdateHealthValue() {
    var food_items = document.getElementsByClassName("food_select");
    var max_health = 25;
    var max_stamina = 50;
    for (var i = 0; i < food_items.length; i += 1) {
        var food_item = foods.find(
            (item) => item.name == food_items.item(i).value
        );
        if (food_item) {
            max_health += food_item.hp;
            max_stamina += food_item.stamina;
        }
    }
    document.getElementById("health").innerText = max_health;
    document.getElementById("stamina").innerText = max_stamina;
    UpdateValues();
}
function LoadBody() {
    // Reset data values
    document.getElementById("health").innerText = 25;
    document.getElementById("stamina").innerText = 50;
    document.getElementById("armour").value = 0;
    document.getElementById("block_armour").value = 0;
    document.getElementById("damage").value = 0;
    // Populate Table Data
    SetArmourTable(0);
    SetShieldsTable(0);
    SetCreaturesTable(0);
    SetFoodTable();
    // Init event handlers
    HanldeUserValueChanged();
    SetComboBoxValues("armour_select", armours, true);
    SetComboBoxValues("shield_select", shields, true);
    SetComboBoxValues("creature_select", creatures, true);
    SetComboBoxValues("food_select", foods, true);

}
function SetComboBoxValues(className, values, append_empty = false) {
    var fields = document.getElementsByClassName(className);

    for (var i = 0; i < fields.length; i += 1) {
        if (append_empty) {
            var option = document.createElement("option");
            option.setAttribute("value", "");
            fields.item(i).append(option);
        }
        values.forEach((value) => {
            var option = document.createElement("option");
            option.setAttribute("value", value.name);
            option.innerText = value.name;
            fields.item(i).append(option);
        });
    }
}
// One time function to set up event handling
function HanldeUserValueChanged() {
    document
        .getElementById("armour_tier")
        .addEventListener("change", (e) => {
            SetArmourTable(e.target.value);
        });
    document
        .getElementById("shield_tier")
        .addEventListener("change", (e) => {
            SetShieldsTable(e.target.value);
        });
    document
        .getElementById("creature_tier")
        .addEventListener("change", (e) => {
            SetCreaturesTable(e.target.value);
        });
}