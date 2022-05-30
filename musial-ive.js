/**
    MUSIAL-IVE v2.0
    Author: Simon Hackl
    Contact: simon.hackl@uni-tuebingen.de
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/**
 * The `SETTINGS` variable is used to store variables used by the web-app, e.g. colors.
 * `SETTINGS` that shall not be changed by user interactions start with a `_` symbol.
 */
var SETTINGS = {
    "_verbose": true
};

/**
 * The `STATE` variable is used to store the current state of the application, i.e. currently loaded data and user interaction.
 */
var STATE = {
    "vDict": null,
    "selectedFeature": null,
    "featureOverviewEchartOption": {
        title: {
            text: 'Leaf Node Color | Feature Variable Positions',
            bottom: '5%',
            right: 'center',
            textStyle: {
                color: '#607196',
                fontSize: 14
            }
        },
        toolbox: {
            feature: {

            },
            bottom: '2%',
            left: '1%'
        },
        visualMap: {
            min: -1,
            max: 50,
            range: [0, 50],
            dimension: 0,
            seriesIndex: 0,
            hoverLink: true,
            inverse: false,
            orient: 'horizontal',
            itemHeight: 1000,
            bottom: '2%',
            align: 'left',
            right: 'center',
            text: ['≥ 50%', '0%'],
            textStyle: {
                color: '#607196',
                fontSize: 12
            },
            calculable: false,
            inRange: {
                color: ['#5F8FFF', '#FF5F8F', '#FFDE5F', '#5FEAFF', '#6DE824']
            },
            outOfRange: {
                color: '#607196'
            },
            formatter: (value) => {
                if ( value === -1 ) {
                    return 'No Feature';
                } else {
                    return Math.round( value ) + "%";
                }
            }
        },
        series: [
            {
                type: 'tree',
                symbol: 'diamond',
                symbolSize: 32,
                edgeShape: 'curve',
                roam: true,
                expandAndCollapse: true,
                initalTreeDepth: 2,
                right: '10%',
                left: '10%',
                label: {
                    position: 'right',
                    fontWeight: 'bold',
                    fontSize: 11,
                    textBorderColor: '#EFF0F8',
                    textBorderWidth: 2
                },
                data: []
            }
        ]
    }
};

var FEATURE_OVERVIEW_ECHART;
/**
 * METHODS TO MANIPULATE AND INTERACT WITH `FEATURE_OVERVIEW_ECHART`
 */
function FEATURE_OVERVIEW_ECHART_addFeature(chr, cls, ftr) {
    let featureOverviewData = STATE.featureOverviewEchartOption.series[0].data;
    let chrLevelNode;
    let clsLevelNode;
    let ftrLevelNode;
    if (featureOverviewData.filter(node => node.name == chr).length == 0) {
        chrLevelNode = {
            name: chr,
            value: -1,
            symbol: 'emptyCircle',
            symbolSize: 12,
            children: []
        };
        featureOverviewData.push(chrLevelNode);
    } else {
        chrLevelNode = featureOverviewData.filter(node => node.name === chr)[0];
    }

    if (chrLevelNode.children.filter(node => node.name === cls).length == 0) {
        clsLevelNode = {
            name: cls,
            value: -1,
            symbol: 'emptyCircle',
            symbolSize: 12,
            children: []
        };
        STATE.featureOverviewEchartOption.clsLevelTotal += 1;
        chrLevelNode.children.push(clsLevelNode);
    } else {
        clsLevelNode = chrLevelNode.children.filter(node => node.name === cls)[0];
    }

    if (clsLevelNode.children.filter(node => node.name === ftr).length == 0) {
        var value = 0;
        var ftrStart = parseInt(STATE.vDict.features[ftr].start);
        var ftrEnd = parseInt(STATE.vDict.features[ftr].end);
        for (let varPos of Object.keys(STATE.vDict.variants)) {
            if ((ftrStart <= parseInt(varPos)) && (parseInt(varPos) <= ftrEnd)) {
                value += 1;
            }
        }
        let variability = value / (ftrEnd - ftrStart + 1);
        ftrLevelNode = {
            name: ftr,
            value: Math.min(100, Math.round(variability * 100)),
            symbol: 'path://M.1193 494.1c-1.125 9.5 6.312 17.87 15.94 17.87l32.06 .0635c8.125 0 15.21-5.833 16.21-13.83c.7501-4.875 1.869-11.17 3.494-18.17h312c1.625 6.875 2.904 13.31 3.529 18.18c1.125 7.1 7.84 13.94 15.97 13.82l32.46-.0625c9.625 0 17.12-8.374 15.99-17.87c-4.625-37.87-25.75-128.1-119.1-207.7c-17.5 12.37-36.98 24.37-58.48 35.49c6.25 4.625 11.56 9.405 17.06 14.15H159.7c21.25-18.12 47.03-35.63 78.65-51.38c172.1-85.5 203.7-218.8 209.5-266.7c1.125-9.5-6.297-17.88-15.92-17.88L399.6 .001c-8.125 0-14.84 5.832-15.96 13.83c-.7501 4.875-1.869 11.17-3.369 18.17H67.74C66.24 25 65.08 18.81 64.33 13.81C63.21 5.813 56.48-.124 48.36 .001L16.1 .1338c-9.625 0-17.09 8.354-15.96 17.85c5.125 42.87 31.29 153.8 159.9 238.1C31.55 340.3 5.245 451.2 .1193 494.1zM223.9 219.7C198.8 205.9 177.6 191.3 159.7 176h128.5C270.4 191.3 249 206.1 223.9 219.7zM355.1 96c-5.875 10.37-12.88 21.12-21 31.1H113.1c-8.25-10.87-15.3-21.63-21.05-32L355.1 96zM93 415.1c5.875-10.37 12.74-21.13 20.87-32h219.4c8.375 10.87 15.48 21.63 21.23 32H93z'
        };
        clsLevelNode.children.push(ftrLevelNode);
    }
    FEATURE_SELECTION_ECHART.setOption(STATE.featureOverviewEchartOption);
};

var PROTEIN_STRUCTURE_VIEWER;
/**
 * METHODS TO MANIPULATE AND INTERACT WITH `PROTEIN_STRUCTURE_VIEW`
 */
function PROTEIN_STRUCTURE_VIEWER_setSelectedFeature( ) {
    PROTEIN_STRUCTURE_VIEWER.clear( );
    PROTEIN_STRUCTURE_VIEWER.addModel( STATE.vDict.features[ STATE.selectedFeature ].allocatedProtein.pdb, "pdb" );
    PROTEIN_STRUCTURE_VIEWER.setStyle(
        {

        },
        {
            cartoon: {
                colorfunc: (atom) => {
                    return '#FFFFFF';
                },
                opacity: 0.9,
                thickness: 0.2,
                arrows: true
            }
        }
    );
    PROTEIN_STRUCTURE_VIEWER.zoomTo();
    PROTEIN_STRUCTURE_VIEWER.render();
};


/**
 * Methods that are executed once the application has loaded.
 */
window.onload = _ => {
    // Initialize the `FEATURE_SELECTION_ECHART` component.
    FEATURE_SELECTION_ECHART = echarts.init(document.getElementById("main-visualize_overview_feature_selection_echart_container"), { "renderer": "canvas" });
    FEATURE_SELECTION_ECHART.setOption(STATE.featureOverviewEchartOption);
    FEATURE_SELECTION_ECHART.on('click', function (params) {
        let selectedFeatureName = params.data.name;
        if ( params.data.children === undefined ) {
            let items =  [
                {type: 'custom', markup: '<div style="text-align: center;"><b style="padding: 8px;"><i class="fa-solid fa-dna"></i>&nbsp;' + selectedFeatureName + '</b></div>'},
                {type: 'seperator'}
            ];
            if ( STATE.vDict.features[ selectedFeatureName ].allocatedProtein !== { } ) {
                items.push( {type: 'button', label: 'Explore Proteoforms', onClick: () => {
                    toggleMainSubcomponent('visualize_proteoforms');
                    PROTEIN_STRUCTURE_VIEWER_setSelectedFeature();
                }} );
            }
            new Contextual({
                items: items,
                width: '182px'
            });
        } else {
            selectedFeatureName = null;
        }
        STATE.selectedFeature = selectedFeatureName;
        document.getElementById( "main-visualize_proteoforms_selected_feature_name" ).innerHTML = selectedFeatureName;
    });
    // Initialize the `PROTEIN_STRUCTURE_VIEW` component.
    PROTEIN_STRUCTURE_VIEWER = $3Dmol.createViewer(
        $('#main-visualize_proteoforms_structure_viewer_3dmol_container'),
        { backgroundColor: '#FAFAFC', id: 'PROTEIN_STRUCTURE_VIEW_CANVAS', antialias: true, cartoonQuality: 6 }
    );
};

/**
 * Sets the value of an existing option in the `SETTINGS` variable.
 * 
 * @param {Text} key    The `key`, i.e. name, of an option to change. 
 * @param {Text} value  The value the accessed option should be set to.
 */
function setSetting(key, value) {
    if (key in SETTINGS) {
        SETTINGS.key = value;
        if (SETTINGS._verbose) {
            console.info("Successfully changed value of SETTINGS stored at key " + key + " to " + value);
        }
    } else {
        if (SETTINGS._verbose) {
            console.warn("Failed to change value of SETTINGS stored at key " + key + "; " + key + " is no valid SETTINGS name.");
        }
        return null;
    }
}

/**
 * Returns the value of an existing option in the `SETTINGS` variable.
 * 
 * @param {Text} key    The `key`, i.e. name, of an option (which value is returned).
 */
function getSetting(key) {
    if (key in SETTINGS) {
        return SETTINGS.key;
    } else {
        if (SETTINGS._verbose) {
            console.warn("Accessed value stored at key " + key + " but " + key + " is no valid SETTINGS name.");
        }
        return null;
    }
}

/**
 * Closes the specified element.
 * 
 * @param {Text} elementId 
 */
function closeElement(elementId) {
    document.getElementById(elementId) ? document.getElementById(elementId).style.display = "none" : null;
}

/**
 * Shows the specified element with the specified display style.
 * 
 * @param {Text} elementId 
 * @param {Text} style 
 */
function showElement(elementId, style) {
    document.getElementById(elementId) ? document.getElementById(elementId).style.display = style : null;
}

/**
 * Shows the specified main subcomponent, i.e. others are closed.
 * 
 * @param {Text} componentId
 */
function toggleMainSubcomponent(componentId) {
    for (let key of ["about", "visualize_overview", "visualize_proteoforms", "settings", "legal_notice"]) {
        if (componentId === key) {
            showElement("main-" + key, "block");
        } else {
            closeElement("main-" + key);
        }
    }
}

/**
 * Handles the user selection of a variant dictionary .json file.
 * 
 * @param {event} event: File selection event. The `target` of the event has to be a file input element with a `files` attribute yielding a `FileList` instance. 
 */
function fileInputChange(event) {
    if (event.isTrusted && event.type === 'change') {
        let file = event.target.files[0];
        initializeState(file);
    }
}

/**
 * Initializes the `STATE` variable based on the content of a MUSIAL v2.0 variant dictionary.
 * 
 * @param {File} file: A `File` instance that specifies the output variant dictionary of a MUSIAL run.
 */
function initializeState(file) {
    var fileReader = new FileReader();
    var fileContent;
    fileReader.onload = function (event) {
        fileContent = event.target.result;
        STATE.vDict = JSON.parse(fileContent);
    };
    if (file !== undefined) {
        fileReader.readAsText(file);
        // Add features parsed from a `.vDict.json` file to the `STATE`.
        window.setTimeout(
            _ => {
                let chr = STATE.vDict.chromosome;
                let fileName = file.name.split('.')[0];
                for (const [ftrName, ftrObj] of Object.entries(STATE.vDict.features)) {
                    if ('class' in ftrObj.annotations && ftrObj.annotations.class !== null) {
                        FEATURE_OVERVIEW_ECHART_addFeature(chr, ftrObj.annotations.class, ftrName);
                    } else {
                        FEATURE_OVERVIEW_ECHART_addFeature(chr, fileName, ftrName);
                    }
                }
            },
            500
        );
    }
}