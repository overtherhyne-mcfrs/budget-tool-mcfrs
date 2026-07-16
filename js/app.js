let currentBudget = [];
let additions = [];


async function loadData() {

    currentBudget = await fetch("data/CurrentBudget.json")
        .then(r => r.json());


    additions = await fetch("data/additions.json")
        .then(r => r.json());


    createScenario(
        currentBudget,
        additions
    );

}


function createScenario(currentBudget, additions) {

    const container =
        document.querySelector("#scenarios");


    container.innerHTML = "";


    new BudgetScenario(
        container,
        currentBudget,
        additions
    );

}


document
    .getElementById("newScenario")
    .addEventListener("click", () => {

        createScenario(
            currentBudget,
            additions
        );

    });


loadData();
