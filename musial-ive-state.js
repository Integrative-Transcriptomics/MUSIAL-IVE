/**
    MUSIAL-IVE v2.1
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

// Mapping of single-letter aminoacid code to numbers.
 export const AMINO_ACID_ENCODING = {
    // Polar (positive), Basic
    "H": 1, // HIS
    "K": 2, // LYS
    "R": 3, // ARG
    // Polar (negative), Acidic
    "D": 4, // ASP
    "E": 5, // GLU
    // Polar (neutral)
    "S": 6, // SER
    "T": 7, // THR
    "N": 8, // ASN
    "Q": 9, // GLN
    // Sulfur bridge forming
    "C": 10, // CYS
    // Aromatic
    "F": 11, // PHE
    "W": 12, // TRP
    "Y": 13, // TYR
    // Aliphatic
    "A": 14, // ALA
    "V": 15, // VAL
    "L": 16, // LEU
    "I": 17, // ILE
    "M": 18, // MET
    "P": 19, // PRO
    "G": 20, // GLY
    // Other
    "X": 21, // ANY
    "*": 22, // TER
    "-": 23 // Gap
};

// Reverse mapping of the AMINO_ACID_ENCODING constant.
export const AMINO_ACID_DECODING = Object.assign( { }, ...Object.entries( AMINO_ACID_ENCODING ).map( ( [ key, value ] ) => ({ [ value ] : key } ) ) );

// Mapping of single-letter aminoacid code to more human readable three letter code.
export const AMINO_ACID_DESIGNATION = {
    // Polar (positive), Basic
    "H": "His (H)", // HIS
    "K": "Lys (K)", // LYS
    "R": "Arg (R)", // ARG
    // Polar (negative), Acidic
    "D": "Asp (D)", // ASP
    "E": "Glu (E)", // GLU
    // Polar (neutral)
    "S": "Ser (S)", // SER
    "T": "Thr (T)", // THR
    "N": "Asn (N)", // ASN
    "Q": "Glu (Q)", // GLN
    // Sulfur bridge forming
    "C": "Cys (C)", // CYS
    // Aromatic
    "F": "Phe (F)", // PHE
    "W": "Trp (W)", // TRP
    "Y": "Tyr (Y)", // TYR
    // Aliphatic
    "A": "Ala (A)", // ALA
    "V": "Val (V)", // VAL
    "L": "Leu (L)", // LEU
    "I": "Iso (I)", // ILE
    "M": "Met (M)", // MET
    "P": "Pro (P)", // PRO
    "G": "Gly (G)", // GLY
    // Other
    "X": "Any (X)", // ANY
    "*": "Ter.", // TER
    "-": "Gap", // Gap
    "None": "None" // Insertion
};

// Mapping of single-letter aminoacid code to colors.
export const AMINO_ACID_COLOR = {
    // Polar (positive), Basic
    "H": "#69b8e2", // HIS
    "K": "#7ec2e7", // LYS
    "R": "#94cceb", // ARG
    // Polar (negative), Acidic
    "D": "#ff6670", // ASP
    "E": "#ff8088", // GLU
    // Polar (neutral)
    "S": "#8fb082", // SER
    "T": "#9dba91", // THR
    "N": "#abc4a1", // ASN
    "Q": "#b9ceb1", // GLN
    // Sulfur bridge forming
    "C": "#ffee80", // CYS
    // Aromatic
    "F": "#b08ed7", // PHE
    "W": "#bda1de", // TRP
    "Y": "#a37bd1", // TYR
    // Aliphatic
    "A": "#4d9099", // ALA
    "V": "#55a0aa", // VAL
    "L": "#66a9b2", // LEU
    "I": "#77b3bb", // ILE
    "M": "#88bcc3", // MET
    "P": "#99c6cc", // PRO
    "G": "#aacfd4", // GLY
    // Other
    "X":"#a89471", // ANY
    "*": "#FF0099", // TER
    "-": "#3c3c3c" // Gap
}

// STATE: Object; Used to store the current state, i.e., all variable values, of the current session.
 export var STATE = {
    // vDict: Object; A variants dictionary (<FILENAME>.vdict.json) output by MUSIAL. 
    "vDict": null,
    // mainVisualizeSelectedFeature: String; Currently selected (genomic) feature.
    "mainVisualizeSelectedFeature": null,
    // mainVisualizeProteoformsSelectedChain: String; Currently selected chain.
    "mainVisualizeProteoformsSelectedChain": null,
    // mainVisualizeProteoformsSelection: Object; Selection information per feature.
    "mainVisualizeProteoformsSelection": { },
    // mainVisualizeProteoformsPositionInformation: Object; Stores information about variants per position.
    "mainVisualizeProteoformsPositionInformation": { },
    // mainVisualizeProteoformsMetaInformation: Object; Stores meta-information about proteoforms.
    "mainVisualizeProteoformsMetaInformation": { },
    // mainVisualizeProteoformsNoProteoforms: null or int; The number of proteoforms of the selected feature.
    "mainVisualizeProteoformsNoProteoforms": null,
    // mainVisualizeProteoformsNoSamples: null or int; The number of samples of the selected feature.
    "mainVisualizeProteoformsNoSamples": null,
    // mainVisualizeProteoformsAnnotationsPerFeature: Object; Stores custom annotation tracks information per feature.
    "mainVisualizeProteoformsAnnotationsPerFeature": { },
    // mainVisualizeOverviewEchart: Object; Echart option specification for the overview echart.
    "mainVisualizeOverviewEchart": {
        title: {
            text: 'Leaf Node Size: No. Proteoforms | Leaf Node Color: Percentage of Variant Positions',
            bottom: '5%',
            right: 'center',
            textStyle: {
                color: '#607196',
                fontSize: 12
            }
        },
        visualMap: {
            min: -1,
            max: 25,
            range: [0, 25],
            dimension: 0,
            seriesIndex: 0,
            hoverLink: true,
            inverse: false,
            orient: 'horizontal',
            itemHeight: 1000,
            bottom: '2%',
            align: 'left',
            right: 'center',
            text: ['≥ 25%', '0%'],
            textStyle: {
                color: '#607196',
                fontSize: 12
            },
            calculable: false,
            inRange: {
                color: ['#5F8FFF', '#FFDE5F', '#FF5F8F' ] //, '#6DE824', '#5FEAFF']
            },
            outOfRange: {
                color: '#607196'
            },
            formatter: (value) => {
                if ( value === -1 ) {
                    return 'No Feature';
                } else {
                    return value + "%";
                }
            }
        },
        series: [
            {
                type: 'tree',
                symbol: 'circle',
                symbolSize: 28,
                animationEasing: 'backOut',
                edgeShape: 'curve',
                roam: true,
                expandAndCollapse: true,
                initalTreeDepth: 2,
                top: '4%',
                right: '4%',
                bottom: '16%',
                left: '4%',
                orient: 'TB',
                label: {
                    position: 'bottom',
                    fontWeight: 'bold',
                    fontSize: 11,
                    textBorderColor: '#EFF0F8',
                    textBorderWidth: 2
                },
                data: []
            }
        ]
    },
    // mainVisualizeProteoformsVariantsEchart: Object; Echart option specification for the per proteoform variants echart.
     "mainVisualizeProteoformsVariantsEchart": {
        title: [ ],
        grid: [
            {
                id: 'GRID_VARIANTS_HEATMAP',
                top: '10%',
                bottom: '10%',
                left: '10%',
                right: '10%',
            },
            {
                id: 'GRID_POSITION_VARIABILITY',
                top: '2%',
                bottom: '92.5%',
                left: '10%',
                right: '10%'
            },
            {
                id: 'GRID_PROTEOFORM_PROPORTION',
                top: '10%',
                bottom: '10%',
                left: '91.5%',
                right: '5%'
            },
            {
                id: 'GRID_CUSTOM_TRACKS',
                top: '0%',
                bottom: '100%',
                left: '50%',
                right: '50%',
                backgroundColor: '#fafafc'
            }
        ],
        tooltip: {
            trigger: 'item',
            triggerOn: 'click',
            formatter: null
        },
        axisPointer: {
            link: {
                xAxisIndex: [ 0, 1 ]
            },
            triggerTooltip: false,
            triggerOn: 'mousemove',
            show: true,
            label: {
                backgroundColor: 'rgba(90, 90, 90, 0.8)',
                fontWeight: 'bold',
                fontSize: 10,
                formatter: ( d ) => {
                    if ( d.axisDimension == 'x' && d.axisIndex == 0 ) {
                        return d.value;
                    } else if ( d.axisDimension == 'x' && d.axisIndex == 1 ) {
                        return "No. Variants " + d.seriesData[ 0 ].data[ 1 ];
                    } else if ( d.axisDimension == 'y' && d.axisIndex == 0 ) {
                        let proteoformKey = ( d.value == "Wild Type Gene" || d.value == "Wild Type Protein" ) ? "WildType" : d.value;
                        let proteoformNoSamples = STATE.vDict.features[ STATE.mainVisualizeSelectedFeature ].allocatedProtein.proteoforms[ proteoformKey ].samples.length;
                        let proteoformSamplePercentage = ( ( proteoformNoSamples / STATE.mainVisualizeProteoformsNoSamples) * 100 ).toFixed( 1 );
                        return d.value + " [" + proteoformSamplePercentage + "%]";
                    } else {
                        return d.value;
                    }
                }
            }
        },
        xAxis: [
            {
                id: 'XAXIS_VARIANTS_HEATMAP',
                type: 'category',
                gridIndex: 0,
                data: [ ],
                splitLine: {
                    show: true,
                    interval: 0
                },
                name: 'Relative Position (wrt. Wild Type)',
                nameLocation: 'center',
                nameGap: 25,
                nameTextStyle: {
                    fontWeight: 'bold'
                },
                axisTick: {
                    alignWithLabel: true,
                    interval: 0
                }
            },
            {
                id: 'XAXIS_POSITION_VARIABILITY',
                type: 'category',
                gridIndex: 1,
                show: false,
                data: [ ]
            },
            {
                id: 'XAXIS_PROTEOFORM_PROPORTION',
                min: 0.0,
                max: 1.0,
                type: 'value',
                gridIndex: 2,
                minInterval: 0.5,
                show: true,
                data: [ 0.0, 1.0 ]
            },
            {
                id: 'XAXIS_CUSTOM_TRACKS',
                type: 'category',
                gridIndex: 3,
                show: false,
                data: [ ],
                axisPointer: {
                    show: false
                }
            }
        ],
        yAxis: [
            {
                id: 'YAXIS_VARIANTS_HEATMAP',
                type: 'category',
                gridIndex: 0,
                inverse: false,
                data: [ ],
                splitLine: {
                    show: true,
                    interval: 0
                },
                name: 'Proteoforms',
                nameLocation: 'center',
                nameGap: 130,
                nameTextStyle: {
                    fontWeight: 'bold'
                },
                axisTick: {
                    alignWithLabel: true,
                    interval: 0
                }
            },
            {
                id: 'YAXIS_POSITION_VARIABILITY',
                type: 'value',
                gridIndex: 1,
                inverse: false,
                axisTick: {
                    show: false
                },
                axisLabel: {
                    show: false
                },
                name: 'No. Variants',
                nameLocation: 'center',
                nameRotate: 0,
                nameGap: 40,
                nameTextStyle: {
                    fontWeight: 'bold'
                }
            },
            {
                id: 'YAXIS_PROTEOFORM_PROPORTION',
                type: 'category',
                gridIndex: 2,
                show: true,
                axisLabel: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                data: [ ],
                name: 'Sample Proportion',
                nameLocation: 'center',
                nameGap: -100,
                nameTextStyle: {
                    fontWeight: 'bold'
                }
            },
            {
                id: 'YAXIS_CUSTOM_TRACKS',
                type: 'category',
                gridIndex: 3,
                show: false,
                data: [ "BottomTrack", "Spacer1", "MidTrack", "Spacer2", "TopTrack" ],
                axisLabel: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                name: 'Annotation Tracks',
                nameLocation: 'center',
                nameRotate: 0,
                nameGap: 40,
                nameTextStyle: {
                    fontWeight: 'bold'
                },
                axisPointer: {
                    show: false
                }
            }
        ],
        dataZoom: [
            {
                type: 'slider',
                xAxisIndex: [ 0, 1, 3 ],
                oriten: 'horizontal',
                realtime: false,
                selectedDataBackground: {
                    lineStyle: {
                        width: 0.0
                    },
                    areaStyle: {
                        opacity: 0.0
                    }
                },
                dataBackground: {
                    lineStyle: {
                        color: '#464646',
                        width: 0.3,
                        type: 'dashed'
                    },
                    areaStyle: {
                        opacity: 0.0
                    }
                },
                top: '2%',
                bottom: '92.5%',
                left: '10%',
                right: '10%',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                fillerColor: 'rgba(96, 113, 150, 0.05)',
                handleColor: 'rgba(96, 113, 150, 0.5)',
                handleSize: '50%',
                handleStyle: { },
                moveHandleSize: 1,
                moveHandleStyle: {
                    color: '#607196'
                },
                emphasis: {
                    handleStyle: { },
                    moveHandleStyle: {
                        color: '#8197cc'
                    }
                }
            },
            {
                type: 'slider',
                yAxisIndex: [ 0, 2 ],
                oritent: 'vertical',
                realtime: false,
                selectedDataBackground: {
                    lineStyle: {
                        width: 0.0
                    },
                    areaStyle: {
                        opacity: 0.0
                    }
                },
                dataBackground: {
                    lineStyle: {
                        color: '#464646',
                        width: 0.3,
                        type: 'dashed'
                    },
                    areaStyle: {
                        opacity: 0.0
                    }
                },
                top: '10%',
                bottom: '10%',
                left: '91.5%',
                right: '5%',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                fillerColor: 'rgba(96, 113, 150, 0.05)',
                handleColor: 'rgba(96, 113, 150, 0.5)',
                handleSize: '50%',
                handleStyle: { },
                moveHandleSize: 1,
                moveHandleStyle: {
                    color: '#607196'
                },
                emphasis: {
                    handleStyle: { },
                    moveHandleStyle: {
                        color: '#8197cc'
                    }
                }
            }
        ],
        visualMap: [
            {
                type: 'piecewise',
                pieces: [
                    // Polar (positive), Basic
                    { min: 1, max: 3, color: AMINO_ACID_COLOR[ 'H' ], label: "Polar, Positive" },
                    // Polar (negative), Acidic
                    { min: 4, max: 5, color: AMINO_ACID_COLOR[ 'D' ], label: "Polar, Negative" },
                    // Polar (neutral)
                    { min: 6, max: 9, color: AMINO_ACID_COLOR[ 'S' ], label: "Polar, Neutral" },
                    // Sulfur bridge forming
                    { min: 10, max: 10, color: AMINO_ACID_COLOR[ 'C' ], label: "Cysteine" },
                    // Aromatic
                    { min: 11, max: 13, color: AMINO_ACID_COLOR[ 'F' ], label: "Aromatic" },
                    // Aliphatic
                    { min: 14, max: 20, color: AMINO_ACID_COLOR[ 'A' ], label: "Aliphatic" },
                    // Alignment gap
                    { min: 23, max: 23, color: AMINO_ACID_COLOR[ '-' ], label: "Gap" },
                    // Termination
                    { min: 22, max: 22, color: AMINO_ACID_COLOR[ '*' ], label: "Termination" },
                    // Any
                    { min: 21, max: 21, color: AMINO_ACID_COLOR[ 'X' ], label: "Unknown/Any" }
                ],
                seriesIndex: [0],
                show: false,
                orient: 'vertical',
                align: 'left',
                right: '1%',
                top: 'center'
            },
            {
                type: 'piecewise',
                pieces: [
                    {
                        gt: 0,
                        lte: 1,
                        color: '#607196',
                        label: '1'
                    },
                    {
                        gt: 1,
                        lte: 2,
                        color: '#9c73af',
                        label: '2'
                    },
                    {
                        gt: 2,
                        lte: 4,
                        color: '#e56b9d',
                        label: '>2'
                    },
                    {
                        gt: 4,
                        lte: 8,
                        color: '#ff7764',
                        label: '>4'
                    },
                    {
                        gt: 8,
                        lte: 23,
                        color: '#ffa600',
                        label: '>8'
                    }
                ],
                seriesIndex: 1,
                show: false,
                selectMode: false,
                itemWidth: 4,
                itemHeight: 10,
                textGap: 1,
                itemGap: 4,
                orient: 'horizontal',
                top: '4.5%',
                left: '5%'

            }
        ],
        series: [
            {
                type: 'heatmap',
                name: 'POSITION_CONTENT',
                xAxisIndex: 0,
                yAxisIndex: 0,
                data: [],
                itemStyle: {
                    borderColor: '#fafafc',
                    borderWidth: 0.1
                },
                progressive: 0,
                animation: false,
                hoverLayerThreshold: 1000
            },
            {
                type: 'line',
                name: 'NO_VARIANTS',
                xAxisIndex: 1,
                yAxisIndex: 1,
                data: [],
                smooth: 0.1,
                showSymbol: false,
                animation: false
            },
            {
                type: 'bar',
                name: 'SAMPLE_PROPORTION',
                xAxisIndex: 2,
                yAxisIndex: 2,
                data: [],
                showSymbol: false,
                smooth: false,
                step: true,
                itemStyle: {
                    opacity: 0.8,
                    color: '#607196'
                },
                animation: false
            }
        ]
    },
    // mainVisualizeProteoformsPositioninformationEchart: Object; Echart option specification for the position information echart.
    "mainVisualizeProteoformsPositioninformationEchart": {
        legend: {
            type: 'scroll',
            right: 'right',
            orient: 'vertical',
            textStyle: {
                fontSize: 9
            },
            selectMode: 'false'
        },
        series: [
            {
                type: 'pie',
                radius: ['45%', '60%'],
                center: ['30%', '50%'],
                avoidLabelOverlap: true,
                itemStyle: {
                    borderRadius: 4
                },
                label: {
                    show: false,
                    position: 'center'
                },
                labelLine: {
                    show: false
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 9,
                        color: '#1c1c1c'
                    }
                },
                data: [ ]
            }
          ]
    }
};