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
            text: 'No Feature Selected',
            bottom: '0',
            left: 'auto',
            textStyle: {
                color: '#607196',
                fontSize: 14
            },
            backgroundColor: '#FFFFFF',
            borderColor: '#E4E5ED',
            borderWidth: 1,
            borderRadius: 1
        },
        visualMap: {
            min: -1,
            max: 50,
            range: [0, 50],
            dimension: 1,
            seriesIndex: 0,
            hoverLink: true,
            inverse: false,
            orient: 'vertical',
            itemHeight: 800,
            bottom: 'center',
            align: 'left',
            right: 20,
            text: ['≥50% Variable Positions', '0% Variable Positions'],
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
                type: 'sunburst',
                radius: ['15%', '95%'],
                nodeClick: 'false',
                emphasis: {
                    focus: 'ancestor'
                },
                levels: [
                    {

                    },
                    {
                        label: {
                            color: '#EFF0F8',
                            rotate: 'tangential'
                        },
                        itemStyle: {
                            borderWidth: 4,
                            borderColor: '#EFF0F8',
                            color: '#6d81ad'
                        },
                        emphasis: {
                            itemStyle: {
                                borderColor: '#FAFAFAC'
                            }
                        }
                    },
                    {
                        label: {
                            color: '#EFF0F8',
                            rotate: 'radial'
                        },
                        itemStyle: {
                            borderWidth: 4,
                            borderColor: '#EFF0F8',
                            color: '#81A4CD'
                        },
                        emphasis: {
                            itemStyle: {
                                borderColor: '#FAFAFAC'
                            }
                        }
                    },
                    {
                        label: {
                            color: '#EFF0F8',
                            rotate: 'radial'
                        },
                        itemStyle: {
                            borderWidth: 4,
                            borderColor: '#EFF0F8'
                        },
                        emphasis: {
                            itemStyle: {
                                borderColor: '#FAFAFAC'
                            }
                        }
                    }
                ],
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
            value: [1, -1],
            children: []
        };
        featureOverviewData.push(chrLevelNode);
    } else {
        chrLevelNode = featureOverviewData.filter(node => node.name === chr)[0];
        chrLevelNode.value = [chrLevelNode.value[0] + 1, -1];
    }

    if (chrLevelNode.children.filter(node => node.name === cls).length == 0) {
        clsLevelNode = {
            name: cls,
            value: [1, -1],
            children: []
        };
        STATE.featureOverviewEchartOption.clsLevelTotal += 1;
        chrLevelNode.children.push(clsLevelNode);
    } else {
        clsLevelNode = chrLevelNode.children.filter(node => node.name === cls)[0];
        clsLevelNode.value = [clsLevelNode.value[0] + 1, -1];
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
            value: [1, Math.min(100, Math.round(variability * 100))]
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
    let featureName = STATE.selectedFeature.split(" > ")[ 2 ];
    PROTEIN_STRUCTURE_VIEWER.clear( );
    PROTEIN_STRUCTURE_VIEWER.addModel( STATE.vDict.features[ featureName ].allocatedProtein.pdb, "pdb" );
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
        let selectedFeature;
        if (params.treePathInfo.length === 4) {
            // document.getElementById( "main-visualize_overview_explore_genotype_button" ).disabled = false;
            document.getElementById("main-visualize_overview_explore_proteoform_button").disabled = false;
            selectedFeature = params.treePathInfo[1].name + " > " + params.treePathInfo[2].name + " > " + params.treePathInfo[3].name;
        } else {
            // document.getElementById( "main-visualize_overview_explore_genotype_button" ).disabled = true;
            document.getElementById("main-visualize_overview_explore_proteoform_button").disabled = true;
            selectedFeature = null;
        }
        STATE.featureOverviewEchartOption.title.text = selectedFeature === null ? 'No Feature Selected' : selectedFeature;
        STATE.selectedFeature = selectedFeature;
        document.getElementById( "main-visualize_proteoforms_selected_feature_name" ).innerHTML = selectedFeature;
        FEATURE_SELECTION_ECHART.setOption(STATE.featureOverviewEchartOption);
    });
    // Initialize the `PROTEIN_STRUCTURE_VIEW` component.
    PROTEIN_STRUCTURE_VIEWER = $3Dmol.createViewer(
        $('#main-visualize_proteoforms_structure_viewer_3dmol_container'),
        { backgroundColor: '#EFF0F8', id: 'PROTEIN_STRUCTURE_VIEW_CANVAS', antialias: true, cartoonQuality: 6 }
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