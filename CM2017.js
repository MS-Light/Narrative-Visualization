var svg1 = d3.select('#svg1');
var width = 1000;
var data_g = d3.csv('https://flunky.github.io/cars2017.csv');
var currentSelectedVehicleType = '4Cylinders';
var vehicleTypeList = ['4Cylinders',
                       '6Cylinders',
                       '8Cylinders',
                       'Diesel',
                       'EV'];
var open_view_all = false;
var average_city_gas = "";
var average_highway_gas = "";
var average_city_diesel = "";
var average_highway_diesel = "";
var average_city_ev = "";
var average_highway_ev = "";
var gasoline_data = "";
var diesel_data = "";
var electric_data = "";

var tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .style("background-color", "black")
    .attr("class", "tooltip")
    .style("border-radius", "5px")
    .style("padding", "15px")
    .style("max-width", "150px")
    .style("color", "white");

function changeVehicleType(vehicleType){
    var svg = d3.select('#svg1');
    svg.selectAll("*").remove();
    if (vehicleType == 'next'){
        switch(currentSelectedVehicleType){
            case '4Cylinders':
                currentSelectedVehicleType = '6Cylinders';
                break;
            case '6Cylinders':
                currentSelectedVehicleType = '8Cylinders';
                break;
            case '8Cylinders':
                currentSelectedVehicleType = 'Diesel';
                diesel_data = data_g.filter(function(d){
                    if (d["Fuel"] == "Diesel")
                        return d;});
                average_city_diesel = d3.mean(diesel_data, d => parseInt(d.AverageCityMPG));
                average_highway_diesel = d3.mean(diesel_data, d => parseInt(d.AverageHighwayMPG));
            
                break;
            case 'Diesel':
                currentSelectedVehicleType = 'EV';
                electric_data = data_g.filter(function(d){
                    if (d["Fuel"] == "Electricity")
                        return d;});
                average_city_ev = d3.mean(electric_data, d => parseInt(d.AverageCityMPG));
                average_highway_ev = d3.mean(electric_data, d => parseInt(d.AverageHighwayMPG));
            
                break;
            case 'EV':
                currentSelectedVehicleType = 'ALL';
                document.getElementById('4cylinders').style.visibility = 'visible';
                document.getElementById('6cylinders').style.visibility = 'visible';
                document.getElementById('8cylinders').style.visibility = 'visible';
                document.getElementById('diesel').style.visibility = 'visible';
                document.getElementById('electric').style.visibility = 'visible';
                document.getElementById('all').style.visibility = 'visible';
                document.getElementById('next').style.visibility = 'hidden';
        }
    }else{
        currentSelectedVehicleType = vehicleType;
    }
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
        case 'ALL':
            visualization = data_g
            document.getElementById("selected_title").innerHTML = "Selected Engine Type: ALL Engine";
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

function drawAnnotation(main_entry, average_city, average_highway, yScale, color1, color2, vehicle_type){
    // add line to show the average city mpg
    main_entry.append("line").style("stroke", color1)
    .style("stroke-width", 3)
    .attr("x1",0).attr("x2",innerWidth - 200).attr("y1", yScale(average_city)).attr("y2", yScale(average_city));
    main_entry.append("text").attr("x", innerWidth - 350).attr("y", yScale(average_city)+10).attr("font-size", "10").style("fill", color1)
    .text("Average City MPG of "+vehicle_type+" Engine");
        // add line to show the average highway mpg
    main_entry.append("line").style("stroke", color2)
    .style("stroke-width", 3)
    .attr("x1",0).attr("x2",innerWidth - 200).attr("y1", yScale(average_highway)).attr("y2", yScale(average_highway));
    main_entry.append("text").attr("x", innerWidth - 370).attr("y", yScale(average_highway)+10).attr("font-size", "10").style("fill", color2)
    .text("Average Highway MPG of "+vehicle_type+" Engine");
    return;
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
        .range([0, innerWidth - 200]);

    var yScale = d3.scaleLinear()
        .domain([Math.min(min_y - 1, 18),max_y + 1])
        .range([innerHeight - 100, 0]);

    var main_graph = svg.append("g");
    var main_entry = main_graph.attr("transform", "translate(50,50)")
        .selectAll("rect").data(selected_data).enter();
    var block_height = Math.min((innerHeight - 100)/(max_y - Math.min(min_y - 1, 18)) - 2, 10);
    main_entry.append("rect")
        .attr('x',function(d,i) {return xScale(d.Make);})
        .attr('y',function(d,i) {return yScale(d.AverageCityMPG) - block_height / 2;})
        .attr('width',xScale.bandwidth() - 5)
        .attr('height',block_height)
        .attr("fill", "#f79d36")
        .on("mouseover", function(d){
            tooltip.text("Vehicle Make: " + d.Make)
            .append("text").text(", Fuel_type: " +d.Fuel)
            .append("text").text(", Engine_Cylinders: " +d.EngineCylinders)
            .append("text").text(", AvgCityMPG: " +d.AverageCityMPG)
            .append("text").text(", AvgHighwayMPG: " +d.AverageHighwayMPG)
            return tooltip.style("visibility", "visible");
        })
        .on("mousemove", function(){return tooltip.style("top", (d3.event.pageY-20)+"px").style("left",(d3.event.pageX+20)+"px");})
        .on("mouseout", function(){return tooltip.style("visibility", "hidden");});

    main_entry.append("rect")
        .attr('x',function(d,i) {return xScale(d.Make);})
        .attr('y',function(d,i) {return yScale(d.AverageHighwayMPG) - block_height/2;})
        .attr('width',xScale.bandwidth() - 5)
        .attr('height',block_height)
        .attr("fill", "#7452d9")
        .on("mouseover", function(d){
            tooltip.text("Vehicle Make: " + d.Make)
            .append("text").text(", Fuel_type: " +d.Fuel)
            .append("text").text(", Engine_Cylinders: " +d.EngineCylinders)
            .append("text").text(", AvgCityMPG: " +d.AverageCityMPG)
            .append("text").text(", AvgHighwayMPG: " +d.AverageHighwayMPG)
            return tooltip.style("visibility", "visible");
        })
        .on("mousemove", function(){return tooltip.style("top", (d3.event.pageY-0)+"px").style("left",(d3.event.pageX+10)+"px");})
        .on("mouseout", function(){return tooltip.style("visibility", "hidden");});
    if (average_city_gas != ""){
        if (currentSelectedVehicleType == 'Diesel' || currentSelectedVehicleType == 'EV'){
            drawAnnotation(main_entry, average_city_gas, average_highway_gas, yScale, "gray", "DimGray", "Gasoline");
        }else{
            drawAnnotation(main_entry, average_city_gas, average_highway_gas, yScale, "darkorange", "purple", "Gasoline");
        }
    }
    if (average_city_diesel != ""){
        if (currentSelectedVehicleType != 'Diesel'){
            drawAnnotation(main_entry, average_city_diesel, average_highway_diesel, yScale, "gray", "DimGray", "Diesel");
        }else{
            drawAnnotation(main_entry, average_city_diesel, average_highway_diesel, yScale, "darkorange", "purple", "Diesel");
        }
    }
    if (average_city_ev != ""){
        if (currentSelectedVehicleType != 'EV'){
            drawAnnotation(main_entry, average_city_ev, average_highway_ev, yScale, "gray", "DimGray", "EV");
        }else{
            drawAnnotation(main_entry, average_city_ev, average_highway_ev, yScale, "darkorange", "purple", "EV");
        }
    }

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
                        return d;});
    gasoline_data = data.filter(function(d){
        if (d["Fuel"] == "Gasoline")
            return d;});
    average_city_gas = d3.mean(gasoline_data, d => parseInt(d.AverageCityMPG));
    average_highway_gas = d3.mean(gasoline_data, d => parseInt(d.AverageHighwayMPG));

    document.getElementById("selected_title").innerHTML = "Selected Engine Type: Gasoline Engine with no more than 4 Cylinders"
    document.getElementById('4cylinders').style.visibility = 'hidden';
    document.getElementById('6cylinders').style.visibility = 'hidden';
    document.getElementById('8cylinders').style.visibility = 'hidden';
    document.getElementById('diesel').style.visibility = 'hidden';
    document.getElementById('electric').style.visibility = 'hidden';
    document.getElementById('all').style.visibility = 'hidden';

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