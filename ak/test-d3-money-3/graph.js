const dims = { width: 300, height: 300, radius: 150 };
const cent = { x: (dims.width / 2) + 5, y: (dims.height / 2) + 5 };

const svg = d3.select('.canvas')
    .append('svg')
    .attr('width', dims.width + 150)
    .attr('height', dims.width + 150)
;

const graph = svg.append('g')
    .attr('transform', `translate(${cent.x}, ${cent.y})`)
;

const pie = d3.pie()
    .sort(null)
    .value(v => v.cost)
;

// paths vs path
const arcPath = d3.arc()
    .outerRadius(dims.radius)
    .innerRadius(dims.radius / 2)
;

const colour = d3.scaleOrdinal(d3['schemeSet3']);

const handleSectorClick = (d, i, n) => {
    const id = d.data.id;
    if (!id) {
        console.log('handleSectorClick() no ID:', id);
        return;
    }

    db.collection('expenses').doc(id).delete();
};

const update = (data) => {
    console.log('update() data:', data);

    // 1. update data
    const paths = graph.selectAll('path').data(pie(data));

    // 2. update domains
    colour.domain(data.map(v => v.name));

    // 3. exiting elements
    paths.exit().remove();

    // 4. updating elements
    paths
        .attr('d', arcPath)
        .attr('stroke', 'white')
        .attr('stroke-width', 3)
        .attr('fill', d => colour(d.data.name))
    ;

    // 5. entering elements
    paths.enter()
        .append('path')
        .attr('d', arcPath)
        .attr('stroke', 'white')
        .attr('stroke-width', 3)
        .attr('fill', d => colour(d.data.name))
        .on('click', handleSectorClick)
    ;


};

let data = [];
db.collection('expenses').onSnapshot((res) => {
    res.docChanges().forEach((change) => {
        const doc = { ...change.doc.data(), id: change.doc.id };

        switch (change.type) {
            case 'added':
                data.push(doc);
                break;

            case 'modified':
                const index = data.findIndex(v => v.id === doc.id);
                data[index] = doc;
                break;

            case 'removed':
                data = data.filter(v => v.id !== doc.id);
                break;
        }

    });
    update(data);
});