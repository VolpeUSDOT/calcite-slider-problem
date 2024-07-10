import esriConfig from '@arcgis/core/config.js'
import FeatureLayer from '@arcgis/core/layers/FeatureLayer'
import MapView from '@arcgis/core/views/MapView'
import Map from '@arcgis/core/Map.js'
import FeatureLayerView from '@arcgis/core/views/layers/FeatureLayerView'
import * as promiseUtils from '@arcgis/core/core/promiseUtils'

import { setAssetPath } from '@esri/calcite-components/dist/components'
setAssetPath('https://js.arcgis.com/calcite-components/2.10.1/assets')

import '@esri/calcite-components/dist/components/calcite-label'
import '@esri/calcite-components/dist/components/calcite-panel'
import '@esri/calcite-components/dist/components/calcite-shell'
import '@esri/calcite-components/dist/components/calcite-shell-panel'
import '@esri/calcite-components/dist/components/calcite-slider'

import '@esri/calcite-components/dist/calcite/calcite.css'
import './style.css'

//esriConfig.apiKey = "YOUR_ACCESS_TOKEN";

let aLayerView: FeatureLayerView

let aLayer = new FeatureLayer({
    id: 'airequity',
    title: 'Air Equity',
    url: 'https://services.arcgis.com/xOi1kZaI0eWDREZv/arcgis/rest/services/US_air_cost_equity_county/FeatureServer',
    visible: true
    //outFields: ['SIGNT1', 'NHS', 'FCLASS', 'AADT_VG']
})

const map = new Map({
    basemap: 'arcgis-topographic',
    layers: [aLayer]
})

const view = new MapView({
    map: map,
    center: [-71.8, 42.2],
    zoom: 9,
    container: 'viewDiv'
})

function setFilter(event: Event) {
    let theSlider = event.target as HTMLCalciteSliderElement

    //console.log(theSlider.value)

    let absoluteMin = theSlider!.min
    let currentMin = theSlider!.minValue

    let currentMax = theSlider!.maxValue
    let absoluteMax = theSlider!.max

    let atMin = absoluteMin === currentMin
    let atMax = absoluteMax === currentMax

    if (atMin && !atMax) {
        aLayerView.filter = { where: 'black_eqr  <= ' + currentMax }
        console.log('at min, not at max')
    } else if (!atMin && atMax) {
        aLayerView.filter = { where: 'black_eqr  >= ' + currentMin }
        console.log('not at min, at max')
    } else if (!atMin && !atMax) {
        aLayerView.filter = { where: 'black_eqr  >= ' + currentMin + ' and black_eqr  <= ' + currentMax }
        console.log('neither at min nor at max')
    } else {
        aLayerView.filter = null
        console.log('at min and max')
    }
}

view.whenLayerView(aLayer).then((lv) => {
    aLayerView = lv // set the global layer view.

    let onFilterSlider = promiseUtils.debounce(setFilter)

    let theSlider = document.getElementById('mySlider') as HTMLCalciteSliderElement

    theSlider.addEventListener('calciteSliderChange', (event) => {
        onFilterSlider(event).catch((err: any) => {
            if (!promiseUtils.isAbortError(err)) {
                console.log('error')
                throw err
            }
        })
    })
})
