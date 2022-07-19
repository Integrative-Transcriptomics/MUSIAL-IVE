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
            formatter: ( p ) => {
                if ( p.seriesIndex === 0 ) {
                    let position = p.name;
                    let proteoformName = STATE.proteoformVariantsEchartOption.yAxis[ 0 ].data[ p.data[ 1 ] ];
                    if ( position.split( "+" )[ 1 ] === "0" ) {
                        let mutatedResidue = AMINO_ACID_DECODING[ p.data[ 2 ] ];
                        let wildTypeResidue = AMINO_ACID_DECODING[ STATE.proteoformVariantsEchartOption.series[ 0 ].data.filter( e => e[ 0 ] == p.data[ 0 ] && e[ 1 ] == STATE.proteoformVariantsEchartOption.yAxis[ 0 ].data.indexOf( "Wild Type Gene" ) )[ 0 ][ 2 ] ];
                        let sampleProportion =  STATE.proteoformVariantsEchartOption.series[ 2 ].data[ STATE.proteoformVariantsEchartOption.yAxis[ 0 ].data.indexOf( proteoformName ) ];
                        let noVariants = STATE.proteoformVariantsEchartOption.series[ 1 ].data.filter( e => e[ 0 ] == position )[ 0 ][ 1 ]
                        let positionComposition = PROTEOFORM_VARIANTS_ECHART_getPositionComposition( position );
                        console.log( positionComposition );
                        let html = `
                            <div>
                                <p>Proteoform <b>` + proteoformName + `</b>&nbsp;(` + Math.round( sampleProportion * STATE.noSamples ) + ` of ` + STATE.noSamples + ` samples)</p>
                                <p>Relative Position <b>` + position + `</b></p>
                                <p>Variant <b>` + AMINO_ACID_DESIGNATION[ wildTypeResidue ] + ` &#8594; ` + AMINO_ACID_DESIGNATION[ mutatedResidue ] + `</b></p>
                                <p>Total Number of Variants <b>` + noVariants + `</b></p>
                                <div id="position_information_echart_container" style="width: 340px; height: 230px;"></div>
                            </div>
                        `;
                        document.getElementById( "main-visualize_proteoforms_position_information_container" ).innerHTML = html;
                        POSITION_INFORMATION_ECHART = echarts.init(document.getElementById("position_information_echart_container"), { "renderer": "canvas" });
                        STATE.positionVariantCompositionEchartOption.series[ 0 ].data = [ ];
                        for ( let [ key, value ] of Object.entries( positionComposition ) ) {
                            STATE.positionVariantCompositionEchartOption.series[ 0 ].data.push( {
                                name: AMINO_ACID_DESIGNATION[ key ] + ", " + value + " of " + Object.values( positionComposition ).reduce( ( i1, i2 ) => i1 + i2 ),
                                value: value,
                                itemStyle: {
                                    color: AMINO_ACID_COLOR[ key ],
                                    borderWidth: key === mutatedResidue ? 5 : 0
                                }
                            } );
                        }
                        POSITION_INFORMATION_ECHART.setOption( STATE.positionVariantCompositionEchartOption );
                        PROTEIN_STRUCTURE_VIEWER_highlightResidue( position.split( "+" )[ 0 ], true );
                    }
                } else {
                    document.getElementById( "main-visualize_proteoforms_position_information_container" ).innerHTML = "";
                }
            }
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
                    { min: 1, max: 3, color: "#69b8e2", label: "Polar, Positive" },
                    // Polar (negative), Acidic
                    { min: 4, max: 5, color: "#ff6670", label: "Polar, Negative" },
                    // Polar (neutral)
                    { min: 6, max: 9, color: "#8fb082", label: "Polar, Neutral" },
                    // Sulfur bridge forming
                    { min: 10, max: 10, color: AMINO_ACID_COLOR[ 'C' ], label: "Cysteine" },
                    // Aromatic
                    { min: 11, max: 13, color: "#b08ed7", label: "Aromatic" },
                    // Aliphatic
                    { min: 14, max: 20, color: "#4d9099", label: "Aliphatic" },
                    // Alignment gap
                    { min: 23, max: 23, color: "#3c3c3c", label: "Gap" },
                    // Termination
                    { min: 22, max: 22, color: "#FF0099", label: "Termination" },
                    // Any
                    { min: 21, max: 21, color: "#a89471", label: "Unknown/Any" }
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