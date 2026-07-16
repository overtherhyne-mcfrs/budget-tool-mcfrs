function total(items = []) {

    return items.reduce(
        (sum, item) => sum + Number(item.Cost),
        0
    );
}

function totalSelected(items, selectedIds) {

    if (selectedIds instanceof Set) {

        return items
            .filter(item => selectedIds.has(item.ID))
            .reduce(
                (sum, item) =>
                    sum + Number(item.Cost),
                0
            );

    }


    return selectedIds.reduce((sum, id) => {

        const item = items.find(
            item => item.ID === id
        );

        return sum + Number(item.Cost);

    }, 0);

}

function formatCurrency(value) {

    return Number(value).toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });

}
