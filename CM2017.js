var svg1 = d3.select('#svg1');
var width = 1000;
var data_g = d3.csv('https://flunky.github.io/cars2017.csv');
var currentSelectedVehicleType = '4Cylinders';
var vehicleTypeList = ['4Cylinders',
                       '6Cylinders',
                       '8Cylinders',
                       'Diesel',
                       'EV'];

var tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .style("background-color", "black")
    .attr("class", "tooltip")
    .style("border-radius", "5px")
    .style("padding", "15px")
    .style("color", "white");

function changeVehicleType(vehicleType){
    var svg = d3.select('#svg1');
    svg.selectAll("*").remove();
    currentSelectedVehicleType = vehicleType;
    var visualization;
    switch(currentSelectedVehicleType){
        case '4Cylinders':
            visualization = data_g.filter(function(d){
                if (d["EngineCylinders"] <= 4 && d["EngineCylinders"] > 0 && d["Fuel"] == "Gasoline")
                    return d;})
            document.getElementById("selected_title").innerHTML = "Selected Engine Type: Gasoline Engine with no more than 4 Cylinders";

            break;
        case '6Cylinders':
            visualization = data_g.filter(function(d){
                if (d["EngineCylinders"] <= 6 && d["EngineCylinders"] > 4 && d["Fuel"] == "Gasoline")
                    return d;})
            document.getElementById("selected_title").innerHTML = "Selected Engine Type: Gasoline Engine with 6 Cylinders";
            break;
        case '8Cylinders':
            visualization = data_g.filter(function(d){
                if (d["EngineCylinders"] >= 8 && d["Fuel"] == "Gasoline")
                    return d;})
            document.getElementById("selected_title").innerHTML = "Selected Engine Type: Gasoline Engine with no less than 8 Cylinders";
            break;
        case 'Diesel':
            visualization = data_g.filter(function(d){
                if (d["Fuel"] == "Diesel")
                    return d;})
            document.getElementById("selected_title").innerHTML = "Selected Engine Type: Diesle Engine";
            break;
        case 'EV':
            visualization = data_g.filter(function(d){
                if (d["Fuel"] == "Electricity")
                    return d;})
            document.getElementById("selected_title").innerHTML = "Selected Engine Type: Electric Engine";
            break;
    }
    var min_y = Math.min(d3.min(visualization, function(d){
                return parseInt(d.AverageCityMPG); }),
                d3.min(visualization, function(d){
                return parseInt(d.AverageHighwayMPG); }));
    var max_y = Math.max(d3.max(visualization, function(d){
                return parseInt(d.AverageCityMPG); }),
                d3.max(visualization, function(d){
                return parseInt(d.AverageHighwayMPG); }));
    drawChart(svg, visualization, min_y, max_y);

}

function drawChart(svg, selected_data, min_y, max_y){
    
    var makes = selected_data.map(function(d){return d.Make});
    var avgcity = selected_data.map(function(d){return parseInt(d.AverageCityMPG)});
    var avghigh = selected_data.map(function(d){return parseInt(d.AverageHighwayMPG)});
    
    var w = window.innerWidth;
    var h = window.innerHeight;

    svg.attr("width", w)
       .attr("height", 1000);

    var xScale = d3.scaleBand()
        .domain(selected_data.map(function (d) { return d.Make; }))
        .range([0, innerWidth - 100]);

    var yScale = d3.scaleLinear()
        .domain([min_y - 1,max_y + 1])
        .range([innerHeight - 100, 0]);

    var main_graph = svg.append("g");
    var main_entry = main_graph.attr("transform", "translate(50,50)")
        .selectAll("rect").data(selected_data).enter();
    main_entry.append("rect")
        .attr('x',function(d,i) {return xScale(d.Make);})
        .attr('y',function(d,i) {return yScale(d.AverageCityMPG) - 5;})
        .attr('width',xScale.bandwidth() - 5)
        .attr('height',function(d,i) {return 10})
        .attr("fill", "#f79d36")
        .on("mouseover", function(d){
            tooltip.text("Vehicle Make: " + d.Make)
            .append('tspan').append("text").attr("dy", "1em").text(", Engine_Cylinders: " +d.EngineCylinders)
            .append('tspan').append("text").attr("dy", "2em").text(", AvgCityMPG: " +d.AverageCityMPG)
            .append('tspan').append("text").attr("dy", "3em").text(", AvgHighwayMPG: " +d.AverageHighwayMPG)
            return tooltip.style("visibility", "visible");
        })
        .on("mousemove", function(){return tooltip.style("top", (d3.event.pageY-20)+"px").style("left",(d3.event.pageX+20)+"px");})
        .on("mouseout", function(){return tooltip.style("visibility", "hidden");});

    main_entry.append("rect")
        .attr('x',function(d,i) {return xScale(d.Make);})
        .attr('y',function(d,i) {return yScale(d.AverageHighwayMPG) - 5;})
        .attr('width',xScale.bandwidth() - 5)
        .attr('height',function(d,i) {return 10})
        .attr("fill", "#7452d9")
        .on("mouseover", function(d){
            tooltip.text("Vehicle Make: " + d.Make)
            .append('tspan').append("text").attr("dy", "1em").text(", Engine_Cylinders: " +d.EngineCylinders)
            .append('tspan').append("text").attr("dy", "2em").text(", AvgCityMPG: " +d.AverageCityMPG)
            .append('tspan').append("text").attr("dy", "3em").text(", AvgHighwayMPG: " +d.AverageHighwayMPG)
            return tooltip.style("visibility", "visible");
        })
        .on("mousemove", function(){return tooltip.style("top", (d3.event.pageY-0)+"px").style("left",(d3.event.pageX+10)+"px");})
        .on("mouseout", function(){return tooltip.style("visibility", "hidden");});

    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);


    svg.append("g")
        .attr("transform", `translate(50,50)`)
        .call(yAxis);

    svg.append("g")
        .attr("transform", `translate(50,`+(h-50)+`)`)
        .call(xAxis)
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-30)")
        .style("text-anchor", "end");
}

async function initialization() {
    var data = await d3.csv('https://flunky.github.io/cars2017.csv');
    var svg = d3.select('#svg1')
    data_g = data;

    visualization = data.filter(function(d){
                    if (d["EngineCylinders"] <= 4 && d["EngineCylinders"] > 0 && d["Fuel"] == "Gasoline")
                        return d;})
    document.getElementById("selected_title").innerHTML = "Selected Engine Type: Gasoline Engine with no more than 4 Cylinders"

    var min_y = Math.min(d3.min(visualization, function(d){
                        return parseInt(d.AverageCityMPG); }),
                        d3.min(visualization, function(d){
                        return parseInt(d.AverageHighwayMPG); }));
    var max_y = Math.max(d3.max(visualization, function(d){
                        return parseInt(d.AverageCityMPG); }),
                         d3.max(visualization, function(d){
                        return parseInt(d.AverageHighwayMPG); }));
    drawChart(svg, visualization, min_y, max_y);
    
}