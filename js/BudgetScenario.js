

class BudgetScenario {

    constructor(container, currentBudget, additions, startingBudget=312000000, targetPercent = 3.5) {

        console.log("=== Constructor Started ===");
        console.log("Budget:", currentBudget);
        console.log("Additions:", additions);

        this.container = container;

        this.currentBudget = currentBudget;
        this.additions = additions;

        this.selectedCuts = new Set();
        this.selectedAdds = [];
        this.startingBudget = startingBudget;
        this.targetPercent = targetPercent;
        this.cutGroups = {};
        this.reductionsCollapsed = true;
        this.additionsCollapsed = true;
        this.isTouch =
            ('ontouchstart' in window) ||
            navigator.maxTouchPoints > 0;

        this.render();
    }


    render() {

        this.container.innerHTML = `

            <h1 class="page-title">
                Scenario
            </h1>

            <details class="instructions-panel" open>

            <h3>Instructions</h3>

            <ol>
                <li>This is a tool meant for a cost savings exercise for the MCFRS Budget. For the purposes of the exercise, you must accept the values as is:</li>
                <ol>
                    <li>You cannot take "partial reductions."</li>
                    <li>Your choices are limited to keep things simple for the exercise.</li>
                </ol>
                <li>Expand the <strong>Additions</strong> and <strong>Reductions</strong> panels to view your options.</li>
                <li>Drag additions into the Selected Additions box.</li>
                <li>Drag reductions into their associated Selected Reductions boxes.</li>
                <li>To clear the selections and start over, click the <strong>New Scenario</strong> Button at the top.</li>
                <li>This is currently designed to work on a computer and may function differently on phones.</li>
                <li>Other Specifics:</li>
                <ol>
                    <li>To add an EMSDO, use the 1-person ALS-PCU 24/7 option; it is not 100% accurate but close enough.</li>
                    <li>Treat a Civ-Mngr as a Section or Unit Lead.</li>
                    <li>Treat a Civ-Clerk as a basic administrative help, no supervisory role</li>
                    <li>Treat a Civilian-Admin-Spec as advanced administrative help, no supervisory role. This would be good for CRR or CAT</li>
                </ol>
            </ol>

        </details>

            


            <div class="scenario-controls">

                <div class="planner-bar">

                    <div class="planner-input">

                        <label>Starting Budget</label>

                        <input
                            id="startingBudget"
                            type="text"
                            value="${formatCurrency(this.startingBudget)}">

                    </div>


                    <div class="planner-input">

                        <label>Target Savings %</label>

                        <input
                            id="targetPercent"
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value="${this.targetPercent}">

                    </div>


                    <div class="planner-stat">

                        <label>Savings Target</label>

                        <div id="savingsTarget">$0</div>

                    </div>


                    <div class="planner-stat">

                        <label>Savings So Far</label>

                        <div id="savingsSoFar">$0</div>

                    </div>


                    <div class="planner-stat">

                        <label>Remaining Gap</label>

                        <div id="remainingGap">$0</div>

                    </div>


                </div>

            </div>


            <hr>


            <div class="scenario-columns">


                <div class="additions-container">

                    <div class="panel-header">

                        <button class="collapse-btn"
                            data-target="additions-body">
                            ▶
                        </button>

                        <h2>Additions</h2>

                        <span id="additions-total">
                            $0
                        </span>

                    </div>


                    <div id="additions-body"
                        class="panel-body collapsed">

                        <div class="drag-section">

                            <div>
                                <h3>Available Additions</h3>
                                <div class="add-list"></div>
                            </div>


                            <div>
                                <h3>Selected Additions</h3>
                                <div class="add-dropzone"></div>
                            </div>

                        </div>

                    </div>

                </div>





                <div class="reductions-container">

                    <div class="panel-header">

                        <button class="collapse-btn"
                            data-target="reductions-body">
                            ▶
                        </button>

                        <h2>Reductions</h2>

                        <span id="reductions-total">
                            $0
                        </span>

                    </div>


                    <div id="reductions-body"
                        class="panel-body collapsed">

                        <div class="drag-section">

                            <div>
                                <h3>Available Reductions</h3>
                                <div class="cut-groups"></div>
                            </div>


                            <div>
                                <h3>Selected Reductions</h3>
                                <div class="selected-cut-groups"></div>
                            </div>

                        </div>

                    </div>

                </div>


            </div>


            <hr>




            <div class="summary"></div>

        `;
        this.container
            .querySelectorAll(".collapse-btn")
            .forEach(button => {

                button.addEventListener("click", () => {

                    const target =
                        this.container.querySelector(
                            "#" + button.dataset.target
                        );


                    target.classList.toggle("collapsed");


                    const isCollapsed =
                        target.classList.contains("collapsed");


                    button.textContent =
                        isCollapsed ? "▶" : "▼";


                    if (button.dataset.target === "reductions-body") {

                        this.reductionsCollapsed = isCollapsed;

                    }


                    if (button.dataset.target === "additions-body") {

                        this.additionsCollapsed = isCollapsed;

                    }

                });

            });
        this.cutGroups = {};


        const cutGroups =
            this.container.querySelector(".cut-groups");

        const selectedGroups =
            this.container.querySelector(".selected-cut-groups");


        const types = [
            ...new Set(
                this.currentBudget.map(item => item.Type)
            )
        ];


        types.forEach(type => {

            const availableSection =
                document.createElement("div");

            availableSection.innerHTML = `
                <details open>

                    <summary>${type}</summary>

                    <div
                        class="cut-list"
                        data-type="${type}">
                    </div>

                </details>
            `;


            const selectedSection =
                document.createElement("div");


            selectedSection.innerHTML = `

                <details open>

                    <summary>
                        ${type}
                        <span class="selected-total">$0</span>
                    </summary>

                    <div
                        class="cut-dropzone"
                        data-type="${type}">
                    </div>

                </details>

            `;


            cutGroups.appendChild(availableSection);

            selectedGroups.appendChild(selectedSection);



            this.cutGroups[type] = {

                available:
                    availableSection.querySelector(".cut-list"),

                selected:
                    selectedSection.querySelector(".cut-dropzone")

            };

        });


        const budgetInput =
            this.container.querySelector("#startingBudget");

        const percentInput =
            this.container.querySelector("#targetPercent");
        const cutDrop = this.container.querySelector(".cut-dropzone");

        const addList = this.container.querySelector(".add-list");
        const addDrop = this.container.querySelector(".add-dropzone");

        // Create reduction cards once
        this.currentBudget.forEach(item => {

            const card = this.createCard(item, "cut");

            // Remember where this card belongs
            card.dataset.category = item.Type;

            this.cutGroups[item.Type]
                .available
                .appendChild(card);

        });


        // Create addition cards once
        this.additions.forEach(item => {

            const card = this.createCard(item, "add");

            card.dataset.category = "add";

            addList.appendChild(card);

        });


        // Setup drag/drop once
    //    Object.keys(this.cutGroups).forEach(type => {

    //         this.setupDropZone(
    //             this.cutGroups[type].available,
    //             this.cutGroups[type].selected,
    //             this.selectedCuts,
    //             "cut",
    //             false
    //         );

    //     });

        Object.keys(this.cutGroups).forEach(type => {

            this.setupReductionDropZone(
                this.cutGroups[type].available,
                this.cutGroups[type].selected,
                this.selectedCuts
            );
        });

        budgetInput.addEventListener("input", () => {

            this.startingBudget =
                Number(budgetInput.value.replace(/,/g, ""));

            this.updateSummary();

        });

        budgetInput.addEventListener("blur", () => {

            budgetInput.value =
                formatCurrency(this.startingBudget);

        });

        budgetInput.addEventListener("focus", () => {

            budgetInput.value = this.startingBudget;

        });

        percentInput.addEventListener("input", () => {

            this.targetPercent =
                Number(percentInput.value);

            this.updateSummary();

        });

        // this.setupDropZone(
        //     addList,
        //     addDrop,
        //     this.selectedAdds,
        //     "add",
        //     true
        // );
        this.setupAdditionDropZone(
            addList,
            addDrop
        );

        this.updateSummary();

    }

    // addDragEvents(card) {

    //     card.addEventListener("dragstart", e => {

    //         this.draggedCard = card;

    //         e.dataTransfer.setData("id", card.dataset.id);
    //         e.dataTransfer.setData("type", card.dataset.type);

    //     });

    // }

    addDragEvents(card) {

        card.addEventListener("dragstart", e => {

            this.draggedCard = card;

            e.dataTransfer.setData("id", card.dataset.id);

        });

        card.addEventListener("dragend", () => {

            this.draggedCard = null;

        });

    }

    createCard(item, type) {

        const card = document.createElement("div");

        card.className = "budget-item";

        card.draggable = true;

        card.dataset.id = item.ID;

        card.dataset.type = type;


        card.innerHTML = `

            <strong>${item.Item}</strong><br>

            ${formatCurrency(item.Cost)}

        `;

        if (this.isTouch) {

            card.addEventListener("click", () => {

                if (type === "cut") {
                    this.toggleCutCard(card);
                } else {
                    this.addAdditionCard(card);
                }

            });

        } else {

            this.addDragEvents(card);

        }


        return card;

    }

    setupReductionDropZone(list, dropZone, selectedCuts) {

        list.addEventListener("dragover", e => e.preventDefault());

        dropZone.addEventListener("dragover", e => e.preventDefault());


        list.addEventListener("drop", e => {

            e.preventDefault();

            const card = this.draggedCard;

            if (!card) return;

            this.cutGroups[card.dataset.category]
                .available
                .appendChild(card);

            selectedCuts.delete(Number(card.dataset.id));

            this.updateSummary();

        });


        dropZone.addEventListener("drop", e => {

            e.preventDefault();

            const card = this.draggedCard;

            if (!card) return;

            const category = card.dataset.category;

            if (category !== dropZone.dataset.type) {
                return;
            }

            dropZone.appendChild(card);

            selectedCuts.add(Number(card.dataset.id));

            this.updateSummary();

        });

    }

    setupAdditionDropZone(addList, addDrop) {

        addList.addEventListener("dragover", e => e.preventDefault());

        addDrop.addEventListener("dragover", e => e.preventDefault());


        // Remove one selected addition
        addList.addEventListener("drop", e => {

            e.preventDefault();

            const card = this.draggedCard;

            if (!card) return;

            const id = Number(card.dataset.id);

            card.remove();

            const index = this.selectedAdds.indexOf(id);

            if (index !== -1) {
                this.selectedAdds.splice(index, 1);
            }

            this.updateSummary();

        });


        // Add another copy
        addDrop.addEventListener("drop", e => {

            e.preventDefault();

            const original = this.draggedCard;

            if (!original) return;

            const clone = original.cloneNode(true);

            this.addDragEvents(clone);

            addDrop.appendChild(clone);

            this.selectedAdds.push(Number(original.dataset.id));

            this.updateSummary();

        });

    }

    // setupDropZone(list, dropZone, selectedSet, type, allowDuplicates = false) {


    //     list.addEventListener("dragover", e => {

    //         e.preventDefault();

    //     });


    //     dropZone.addEventListener("dragover", e => {

    //         e.preventDefault();

    //     });



    //     // Moving item back to available list
    //     list.addEventListener("drop", e => {

    //         e.preventDefault();


    //         const id = Number(
    //             e.dataTransfer.getData("id")
    //         );


    //         const draggedType =
    //             e.dataTransfer.getData("type");


    //         if (draggedType !== type) {
    //             return;
    //         }



    //         const card = this.draggedCard;

    //         if (allowDuplicates) {

    //             // Remove the clone from the selected area
    //             card.remove();

    //             // Remove one occurrence from the array
    //             const index = selectedSet.indexOf(id);

    //             if (index !== -1) {
    //                 selectedSet.splice(index, 1);
    //             }

    //         } else {

    //             // Move the reduction card back
    //             this.cutGroups[card.dataset.category]
    //                 .available
    //                 .appendChild(card);

    //             selectedSet.delete(id);

    //         }

    //         this.updateSummary();

    //     });





    //     // Moving item into selected list
    //     dropZone.addEventListener("drop", e => {

    //         e.preventDefault();


    //         const id = Number(
    //             e.dataTransfer.getData("id")
    //         );


    //         const draggedType =
    //             e.dataTransfer.getData("type");


    //         if (draggedType !== type) {
    //             return;
    //         }


    //         const originalCard = this.container.querySelector(
    //             `.budget-item[data-id="${id}"][data-type="${type}"]`
    //         );


    //         if (!originalCard) {
    //             console.log("Card not found:", id);
    //             return;
    //         }


    //         if (!allowDuplicates) {

    //             const category = originalCard.dataset.category;


    //             if (category !== dropZone.dataset.type) {
    //                 return;
    //             }

    //         }


    //         let newCard;


    //         if (allowDuplicates) {

    //             // Create a copy and leave original available
    //             newCard = originalCard.cloneNode(true);
    //             this.addDragEvents(newCard);

    //         } else {

    //             // Move the original card
    //             newCard = originalCard;

    //         }


    //         dropZone.appendChild(newCard);



    //         if (allowDuplicates) {

    //             selectedSet.push(id);

    //         } else {

    //             selectedSet.add(id);

    //         }


    //         this.updateSummary();

    //     });

    // }

    toggleCutCard(card) {

        const id = Number(card.dataset.id);

        if (this.selectedCuts.has(id)) {

            this.selectedCuts.delete(id);

            this.cutGroups[card.dataset.category]
                .available
                .appendChild(card);

        } else {

            this.selectedCuts.add(id);

            this.cutGroups[card.dataset.category]
                .selected
                .appendChild(card);

        }

        this.updateSummary();

    }

    addAdditionCard(card) {

        const clone = card.cloneNode(true);

        this.addTouchRemove(clone);

        this.container
            .querySelector(".add-dropzone")
            .appendChild(clone);

        this.selectedAdds.push(Number(card.dataset.id));

        this.updateSummary();

    }

    addTouchRemove(card) {

        card.addEventListener("click", () => {

            const id = Number(card.dataset.id);

            const index = this.selectedAdds.indexOf(id);

            if (index !== -1) {

                this.selectedAdds.splice(index, 1);

            }

            card.remove();

            this.updateSummary();

        });

    }


    updateSummary() {


        const original = total(
            this.currentBudget
        );


        const cuts = totalSelected(
            this.currentBudget,
            this.selectedCuts
        );


        const adds = totalSelected(
            this.additions,
            this.selectedAdds
        );

        this.container.querySelector(
            "#reductions-total"
        ).textContent =
            "-" + formatCurrency(cuts);


        this.container.querySelector(
            "#additions-total"
        ).textContent =
            "+" + formatCurrency(adds);

        const savingsTarget =
            this.startingBudget *
            (this.targetPercent / 100);

        const savingsSoFar =
            cuts - adds;

        const remainingGap =
            savingsTarget - savingsSoFar;


        const finalBudget =
            this.startingBudget - cuts + adds;

        

        this.container.querySelector(
            "#savingsTarget"
        ).textContent =
            formatCurrency(savingsTarget);

        this.container.querySelector(
            "#savingsSoFar"
        ).textContent =
            formatCurrency(savingsSoFar);

        const gap =
            this.container.querySelector("#remainingGap");

        gap.textContent =
            formatCurrency(remainingGap);

        gap.className =
            remainingGap <= 0
                ? "goal-met"
                : "goal-open";

        Object.keys(this.cutGroups).forEach(type => {

            // Find all selected cards in this category
            const cards = this.cutGroups[type]
                .selected
                .querySelectorAll(".budget-item");

            let total = 0;

            cards.forEach(card => {

                const id = Number(card.dataset.id);

                const item = this.currentBudget.find(
                    x => x.ID === id
                );

                if (item) {
                    total += item.Cost;
                }

            });

            const totalSpan =
                this.cutGroups[type]
                    .selected
                    .parentElement
                    .querySelector(".selected-total");

            totalSpan.textContent =
                "-" + formatCurrency(total);

        });

        this.container.querySelector(".summary").innerHTML = `

            <h2>Summary</h2>


            <h3>
                Original Budget:
                <strong id="final-budget">${formatCurrency(this.startingBudget)}</strong>
            </h3>


            <h3>
                Reductions:
                <strong id="final-budget">-${formatCurrency(cuts)}</strong>
            </h3>


            <h3>
                Additions:
                <strong id="final-budget">+${formatCurrency(adds)}</strong>
            </h3>


            <h2>
                Final Budget:
                <strong id="final-budget">${formatCurrency(finalBudget)}</strong>
            </h2>

        `;

    }

}