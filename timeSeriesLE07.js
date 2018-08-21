//this is a script to generate time series of EVI (enhanced vegetation index) from Landsat 7 dataset available on GEE ^ export it to be used eg. in R
//using GEE UI draw a polygone over AOI, call it polygon 
//Load in image collection id LANDSAT/LE07/C01/T1_TOA and change variable name to LS07
var startDate = '1999-01-01'; //type in required dates of observation (LE07 extends Jan 1, 1999 - Jul 22, 2018)
var endDate = '2010-01-01';
var bands = ['B4', 'B3', 'B1']; //bands needed for EVI computation
var LS07 = ee.ImageCollection(L07
          .filterBounds(polygon) //your AOI
          .filterDate(startDate, endDate)
          .select(['B4', 'B3', 'B1']));

//compute EVI for each image in the collection and make each inherit a time_start from band 4
function makeEVI(image){
  return image.expression(
    '2.5 * ((NIR - RED) / (NIR + 6 * RED - 7.5 * BLUE + 1))', {
      'NIR': image.select('B4'),
      'RED': image.select('B3'),
      'BLUE': image.select('B1')
}).set({'system:time_start': image.select('B4').date()});
}

//clip the images in the collection to speed up the process and avoid redundant data
function clip(image){
  return image.clip(polygon);
}

//prepare time series of only cropped EVI images
var tsCollection = LS07.map(clip).map(makeEVI);

//uncomment the below 2 lines if you want to see the collection of EVI images on the map
// Map.addLayer(tsCollection);
// Map.centerObject(tsCollection, 8);

//generate a time series chart and add it to the map
var chart = ui.Chart.image.series({
  imageCollection: tsCollection,
  region: polygon,
  reducer: ee.Reducer.mean(),
  scale: 200
});

chart.style().set({
  position: 'bottom-right',
  width: '500px',
  height: '300px'
});
Map.add(chart);
//click on the chart to open it in a separate window. This allows us to export it as a csv file. there supposedly is an export option but it didn't work for me
