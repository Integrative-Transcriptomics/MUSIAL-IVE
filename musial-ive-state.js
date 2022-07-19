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

/**
 * Definition of constants.
 */
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

export const AMINO_ACID_DECODING = Object.assign( { }, ...Object.entries( AMINO_ACID_ENCODING ).map( ( [ key, value ] ) => ({ [ value ] : key } ) ) );

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
    "-": "Gap" // Gap
};

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

/**
 * The `STATE` variable is used to store the current state of the application, i.e. currently loaded data and user interaction.
 */
 export var STATE = {
    "vDict": null,
    "selectedFeature": null,
    "selectedChain": null,
    "highlightedResidues": [],
    "perPositionVariantInformation": {},
    "perProteoformMetaInformation": {},
    "noProteoforms": null,
    "noSamples": null,
    "featureOverviewEchartOption": {
        title: {
            text: 'Leaf Node Color: Percentage of Variant Positions',
            bottom: '5%',
            right: 'center',
            textStyle: {
                color: '#607196',
                fontSize: 12
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
    },
    "proteoformVariantsEchartOption": {
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
            }
        ],
        tooltip: {
            trigger: 'item',
            triggerOn: 'click',
            alwaysShowContent: true,
            axisPointer: {
                type: 'cross'
            },
            position: [ '1%', '-85%' ],
            extraCssText: "height: 80%; width: 22%; overflow-y: scroll;",
            borderColor: '#607196',
            borderWidth: 0,
            formatter: null
        },
        axisPointer: {
            link: {
                xAxisIndex: [ 0 ],
                yAxisIndex: [ 0 ]
            },
            snap: true,
            triggerTooltip: false,
            triggerOn: 'mousemove',
            show: true
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
                name: 'Global Proteoform Position',
                nameLocation: 'center',
                nameGap: 25,
                nameTextStyle: {
                    fontWeight: 'bold'
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
                nameGap: 70,
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
                xAxisIndex: 0,
                yAxisIndex: 0,
                data: [],
                itemStyle: {
                    borderColor: '#fafafc',
                    borderWidth: 0.2
                },
                progressive: 1000,
                animation: false
            },
            {
                type: 'line',
                xAxisIndex: 1,
                yAxisIndex: 1,
                data: [],
                smooth: false,
                showSymbol: false
            },
            {
                type: 'bar',
                xAxisIndex: 2,
                yAxisIndex: 2,
                data: [],
                showSymbol: false,
                smooth: false,
                step: true,
                itemStyle: {
                    opacity: 0.8,
                    color: '#607196'
                }
            }
        ]
    },
    "positionVariantCompositionEchartOption": {
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