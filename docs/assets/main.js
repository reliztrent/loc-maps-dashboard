const app = Vue.createApp({
    data() {
      return {
        rawData: {
          sanbornOnline: undefined,
          mapOnline: undefined,
          gmdmarDailyTotals: undefined,
          sanbornDailyTotals: undefined,
          mapDailyTotals: undefined,
          gmdmarDailyMods: undefined,
          gmdmarModList: undefined,
          mapPartOf: undefined,
        },
        cleanedData: {
          //sanbornOnline_clean: undefined,
          //mapOnline_clean: undefined,
          gmdmarDailyTotalsDates_clean: undefined,
          gmdmarDailyTotalsOnline_clean: undefined,
          sanbornDailyTotalsDates_clean: undefined,
          sanbornDailyTotalsOnline_clean: undefined,
          mapDailyTotalsDates_clean: undefined,
          mapDailyTotalsOnline_clean: undefined,
          mapDailyTotalsBibs_clean: undefined,
          gmdmarDailyModsDates_clean: undefined,
          gmdmarDailyModsOnline_clean: undefined,
          gmdmarModList_clean: undefined,
          mapPartOf_clean: undefined,
        },
        dataPoints: {
          sets: {
            mapsOnline: {},
            bibsOnline: {},
            sanbornsOnline: {},
            gmdmarOnline: {},
          },
        },
        dateRanges: ['','','','','',''],
        selectedDateRange : 'Select timerange',
        hoverStyle: {
          bordercolor: '#2d2d2d',
          font: {color: '#fff'},
          bgcolor: '#2d2d2d'
        },
        lineStyle: {
          line: {
            width: 3,
            shape: 'spline'
          },
          marker: {
            size: 6
          }
        },
        markerSwitch: 'lines+markers',
        //line, main blue, pie second color
        colorScheme: ['#ffc57d','#558dff','#8cd3dd','#4bd6b1','#6393fa','#ef553b','#00cc96'],
        config: {responsive: true},
        lineLayout: {
          yaxis: {
            gridcolor: '#fff',
            zeroline: false,
            showticklabels: true,
            showgrid: true
          },
          xaxis: {
            rangeslider: {
              bgcolor: '#e5ecf6',
              rangemode: 'match',
              autorange: true,
            },
            range: ['2020-08-30',this.convertDateString(new Date())],
            gridcolor: '#fff',
            showgrid: true,
            showline: false,
            zeroline: false,
            showticklabels: true,
            tickfont: {
              size:'.9rem',
            }
          }
        },
        config: {responsive: true},
        titles: {
          totalsOverTime: {
            titles: ['GMD.MAR Online','Sanborns Online','Maps Online', 'Map Catalog Records'],
            anchors: ['#graphDivA','#graphDivB','#graphDivF','#graphDivG']
          },
          modsOverTime: {
            titles: ['GMD.MAR Modifications'],
            anchors: ['#graphDivC']
          },
          onlineVnot: {
            titles: ['Maps: Online vs. Not Online', 'Sanborns: Online vs Not Online'],
            shortTitles: ['Maps<br>Online', 'Sanborns<br>Online'],
            anchors: ['#graphDivD','#graphDivE']
          },
          facets: {
            titles: ['Online Maps, by Collection'],
            anchors: ['#graphDivI']
          }
        },
      }
    }, 
    computed: {
      
    },
    methods: {
      //helper methods
      convertDateString(fullDate) {
        dd = String(fullDate.getDate()).padStart(2, '0'),
        mm = String(fullDate.getMonth() + 1).padStart(2, '0'), //January is 0
        yyyy = fullDate.getFullYear();
        return yyyy + '-' + mm + '-' + dd;
      },
      tabSelector(t) {
        const selected = t.currentTarget.getAttribute('option');
        const tabSet = t.currentTarget.getAttribute('tab-set');
        console.log(tabSet);
  
        //update tab activation classes
        let tabSelector = document.querySelectorAll("[tab-set='"+tabSet+"']");
        [].forEach.call(tabSelector, function(el) {
          el.classList.remove("active");
        });
        t.currentTarget.classList.add("active");
        
        //add hide class to all charts in card
        let options = document.querySelectorAll('.'+tabSet);
        [].forEach.call(options, function(el) {
          el.classList.add("plotly-hide");
        });
        //remove hide class from target chart & update width
        let target = document.getElementById(selected);
        target.classList.remove("plotly-hide");
        let parentWidth = target.parentElement.clientWidth;
        parentWidth -= (
          parseFloat(getComputedStyle(target.parentElement).paddingLeft) + 
          parseFloat(getComputedStyle(target.parentElement).paddingRight)
        );
        Plotly.relayout(target, {
          width: parentWidth,
        });
      },
      sortJson(prop) {   
        console.log('   !!!! sortJson just kicked off.'); 
        return function(a, b) {    
            if (a[prop] > b[prop]) {    
                return 1;    
            } else if (a[prop] < b[prop]) {    
                return -1;    
            }    
            return 0;    
        }    
      },
      //single-number presentors
      dataPointsCalculator(data,dates) {
        console.log('   !!!! dataPointsCalculator just kicked off.')
        let sets = {};
        let today = new Date();
        let weekAgo = this.convertDateString(new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000)));
        let thirtyDaysAgo = this.convertDateString(new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000)));
        sets.todayTotal = data[data.length-1];        
        for(var i = 0; i < dates.length; i += 1) {
          if(dates[i] === '2020-10-01') {
            sets.fy21StartIndex = i;
            sets.fy21StartTotal = data[i];
            sets.fy21Increase = data[data.length-1] - data[i];
            sets.fy21PercentIncrease = (100*(sets.fy21Increase/sets.fy21StartTotal)).toFixed(2);
          };
          if (dates[i] === weekAgo) {
            sets.weekAgoTotal = data[i];
            sets.weekAgoIncrease = data[data.length-1] - data[i];
          };
          if (dates[i] === thirtyDaysAgo) {
            sets.thirtyDaysAgoTotal = data[i];
            sets.thirtyDaysAgoIncrease = data[data.length-1] - data[i];
          };
        };
        console.log(sets);
        return sets;
      },
      //mapOnlinePie
      mapOnlinePieTrace() {
        console.log('   !!! mapOnlinePieTrace just kicked off.');
        let total = {};
        total.values = [this.rawData.mapOnline[0].count,this.rawData.mapOnline[1].count];
        total.labels = [this.rawData.mapOnline[0].facet,this.rawData.mapOnline[1].facet];
        for (i = 0; i < total.labels.length; i++) {
          total.labels[i] = total.labels[i].replace('true','online');
          total.labels[i] = total.labels[i].replace('false','not online');
        };
        total.type  = 'pie';
        total.hole = '.5';
        total.textinfo = "none";
        total.hoverlabel = this.hoverStyle;
        //total.textposition = "outside";
        return total;
      },
      mapOnlinePieLayout() {
        console.log('   !!!! mapOnlinePieLayout just kicked off.');
        let layout = {};
        layout.autosize = true,
        layout.title = {},
        layout.title.text = this.titles.onlineVnot.shortTitles[0],
        layout.title.y = .5,
        layout.title.yref = 'paper',
        layout.title.x = .5,
        layout.title.xref = 'paper',
        layout.margin = {},
        layout.margin.l = 0,
        layout.margin.r = 0,
        layout.margin.t = 40,
        layout.colorway = [this.colorScheme[2],this.colorScheme[1]],
        layout.showlegend = false;
        return layout;
      },
      mapOnlinePiePlotly(div) {
        console.log('   !!!! startDivE just kicked off.');
        let insertDiv = document.getElementById(div);
        Plotly.newPlot(
          insertDiv, 
          [this.mapOnlinePieTrace()],
          this.mapOnlinePieLayout(),
          this.config
        );
      },
      //mapOnlineSanborn
      sanbornOnlinePieTrace() {
        console.log('   !!!! sanbornOnlinePie just kicked off.');
        let total = {};
        total.values = [this.rawData.sanbornOnline[0].count,this.rawData.sanbornOnline[1].count];
        total.labels = [this.rawData.sanbornOnline[0].facet,this.rawData.sanbornOnline[1].facet];
        for (i = 0; i < total.labels.length; i++) {
          total.labels[i] = total.labels[i].replace('true','online');
          total.labels[i] = total.labels[i].replace('false','not online');
        };
        total.type = 'pie';
        total.hole = '.5';
        total.textinfo = "none";
        total.hoverlabel = this.hoverStyle;
        //total.textposition = "outside";
        total.rotation = "180";
        return total;
      },
      sanbornOnlinePieLayout() {
        console.log('   !!!! sanbornOnlinePieLayout just kicked off.');
        let layout = {};
        layout.title = {};
        layout.title.text = this.titles.onlineVnot.shortTitles[1],
        layout.title.y = .5,
        layout.title.yref = 'paper',
        layout.title.x = .5,
        layout.title.xref = 'paper',
        layout.margin = {},
        layout.margin.l = 0,
        layout.margin.r = 0,
        layout.margin.t = 40,
        layout.colorway = [this.colorScheme[1],this.colorScheme[2]],
        layout.showlegend = false;
        return layout;
      },
      sanbornOnlinePiePlotly(div) {
        console.log('   !!!! startDivD just kicked off.');
        let insertDiv = document.getElementById(div);
        Plotly.newPlot(
          insertDiv, 
          [this.sanbornOnlinePieTrace()],
          this.sanbornOnlinePieLayout(),
          this.config
        );
      },
      //gmdmarDailyTotals
      gmdmarDailyTotalsDates() {
        console.log('   !!!! gmdmarDailyTotalsDates just kicked off.');
        let dates = [];
        for (i = 0; i < this.rawData.gmdmarDailyTotals.length; i++) {
          dates.push(this.rawData.gmdmarDailyTotals[i].facet)
        };
        return dates;
      },
      gmdmarDailyTotalsOnline() {
        console.log('   !!!! gmdmarDailyCountOnlineCounts just kicked off.');
        let online = [];
        for (i = 0; i < this.rawData.gmdmarDailyTotals.length; i++) {
          online.push(this.rawData.gmdmarDailyTotals[i].online)
        };
        return online;
      },
      gmdmarDailyTotalsOnlineTrace() {
        console.log('   !!!! gmdmarDailyTotalsOnlineTrace just kicked off.');
        let total = {};
        total.x = this.gmdmarDailyTotalsDates();
        total.y = this.gmdmarDailyTotalsOnline();
        total.mode = this.markerSwitch;
        total.type = 'scatter';
        total.name = 'GMD.MAR';
        total.hoverinfo = "y+x";
        total.hoverlabel = this.hoverStyle;
        total.line = this.lineStyle.line;
        total.marker = this.lineStyle.marker;
        return total;
      },
      gmdmarDailyTotalsOnlineLayout() {
        console.log('   !!!! gmdmarDailyTotalsOnlineLayout just kicked off.');
        let layout = {};
        layout.title = this.titles.totalsOverTime.titles[0],
        layout.xaxis = this.lineLayout.xaxis,
        layout.yaxis = this.lineLayout.yaxis,
        layout.colorway = this.colorScheme,
        layout.plot_bgcolor = '#e5ecf6';
        return layout;
      },
      gmdmarDailyTotalsOnlinePlotly(div) {
        console.log('   !!!! gmdmarDailyTotalsOnlinePlotly just kicked off.');
        let insertDiv = document.getElementById(div);
        Plotly.newPlot(
          insertDiv, 
          [this.gmdmarDailyTotalsOnlineTrace()],
          this.gmdmarDailyTotalsOnlineLayout(),
          this.config,
        ); 
      },
      //sanbornDailyTotals
      sanbornDailyTotalsDates() {
        console.log('   !!!! sanbornDailyTotalsDates just kicked off.');
        let dates = [];
        for (i = 0; i < this.rawData.sanbornDailyTotals.length; i++) {
          dates.push(this.rawData.sanbornDailyTotals[i].facet)
        };
        return dates;
      },
      sanbornDailyTotalsOnline() {
        console.log('   !!!! sanbornDailyTotalsOnline just kicked off.');
        let online = [];
        for (i = 0; i < this.rawData.sanbornDailyTotals.length; i++) {
          online.push(this.rawData.sanbornDailyTotals[i].online)
        };
        return online;
      },
      sanbornDailyTotalsOnlineTrace() {
        console.log('   !!!! sanbornDailyTotalOnlineTrace just kicked off.');
        let total = {};
        total.x = this.sanbornDailyTotalsDates();
        total.y = this.sanbornDailyTotalsOnline();
        total.mode = this.markerSwitch;
        total.type = 'scatter';
        total.name = 'Sanborn';
        total.line = {width: 2};
        total.hoverinfo = "y+x";
        total.hoverlabel = this.hoverStyle;
        return total;
      },
      sanbornDailyTotalsOnlineLayout() {
        console.log('   !!!! sanbornDailyTotalsOnlineLayout just kicked off.');
        let layout = {};
        layout.title = this.titles.totalsOverTime.titles[1],
        layout.xaxis = this.lineLayout.xaxis,
        layout.yaxis = this.lineLayout.yaxis,
        layout.colorway = this.colorScheme,
        layout.plot_bgcolor = '#e5ecf6';
        return layout;
      },
      sanbornDailyTotalsOnlinePlotly(div) {
        console.log('   !!!! sanbornDailyTotalsOnlinePlotly just kicked off.');
        let insertDiv = document.getElementById(div);
        Plotly.newPlot(
          insertDiv, 
          [this.sanbornDailyTotalsOnlineTrace()],
          this.sanbornDailyTotalsOnlineLayout(),
          this.config,
        ); 
      },
      //mapDailyTotals
      mapDailyTotalsDates() {
        console.log('   !!!! mapDailyTotalsDates just kicked off.');
        let dates = [];
        for (i = 0; i < this.rawData.mapDailyTotals.length; i++) {
          dates.push(this.rawData.mapDailyTotals[i].facet)
        };
        return dates;
      },
      mapDailyTotalsOnline() {
        console.log('   !!!! mapDailyTotalsOnline just kicked off.');
        let online = [];
        for (i = 0; i < this.rawData.mapDailyTotals.length; i++) {
          online.push(this.rawData.mapDailyTotals[i].online)
        };
        return online;
      },
      mapDailyTotalsOnlineTrace() {
        console.log('   !!!! mapDailyTotalOnline just kicked off.');
        let total = {};
        total.x = this.mapDailyTotalsDates();
        total.y = this.mapDailyTotalsOnline();
        total.mode  = this.markerSwitch;
        total.type = 'scatter';
        total.name = 'online';
        total.line = {width: 2};
        total.hoverinfo = "y+x";
        total.hoverlabel = this.hoverStyle;
        return total;
      },    
      mapDailyTotalsOnlineLayout() {
        console.log('   !!!! mapDailyTotalsOnlineLayout just kicked off.');
        let layout = {};
        layout.title = this.titles.totalsOverTime.titles[2],
        layout.xaxis = this.lineLayout.xaxis,
        layout.yaxis = this.lineLayout.yaxis,
        layout.colorway = this.colorScheme,
        layout.plot_bgcolor = '#e5ecf6';
        return layout;
      },
      mapDailyTotalsOnlinePlotly(div) {
        console.log('   !!!! startDivF just kicked off.');
        let insertDiv = document.getElementById(div);
        Plotly.newPlot(
          insertDiv, 
          [this.mapDailyTotalsOnlineTrace()],
          this.mapDailyTotalsOnlineLayout(),
          this.config
        );
      },
      //bibs (connected to mapDailyTotals)
      mapDailyTotalsBibs() {
        console.log('   !!!! mapDailyTotalsBibs just kicked off.');
        let bibs = [];
          for (i = 0; i < this.rawData.mapDailyTotals.length; i++) {
            bibs.push(this.rawData.mapDailyTotals[i].not_online)
          };
          return bibs;
      },
      mapDailyTotalsBibsLayout() {
        console.log('   !!!! mapDailyTotalBibsLayout just kicked off.');
        let layout = {};
        layout.title = this.titles.totalsOverTime.titles[3],
        layout.xaxis = this.lineLayout.xaxis,
        layout.yaxis = this.lineLayout.yaxis,
        layout.colorway = this.colorScheme,
        layout.plot_bgcolor = '#e5ecf6';
        return layout;
      },
      mapDailyTotalsBibsTrace() {
        console.log('   !!!! mapDailyTotalBibs just kicked off.');
        let total = {};
        total.x = this.mapDailyTotalsDates();
        total.y = this.mapDailyTotalsBibs();
        total.mode  = this.markerSwitch;
        total.type = 'scatter';
        total.name = 'bib records';
        total.line = {width: 2};
        total.hoverinfo = "y+x";
        total.hoverlabel = this.hoverStyle;
        return total;
      },
      mapDailyTotalsBibsPlotly(div) {
        console.log('   !!!! startDivG just kicked off.');
        let insertDiv = document.getElementById(div);
        Plotly.newPlot(
          insertDiv, 
          [this.mapDailyTotalsBibsTrace()],
          this.mapDailyTotalsBibsLayout(),
          this.config
        );
      },
      //gmdmarDailyMods
      gmdmarDailyModsDates() {
        console.log('   !!!! gmdmarDailyModCountDates just kicked off.');
        let dates = []; 
        for (i = 0; i < this.rawData.gmdmarDailyMods.length; i++) {
          dates.push(this.rawData.gmdmarDailyMods[i].facet)
        };
        return dates;
      },
      gmdmarDailyModsOnline() {
        console.log('   !!!! gmdmarDailyModCountsOnline just kicked off.');
        let modsOnline = []; 
          for (i = 0; i < this.rawData.gmdmarDailyMods.length; i++) {
            modsOnline.push(this.rawData.gmdmarDailyMods[i].online)
          };
          return modsOnline;
      },
      gmdmarDailyModsOnlineTrace() {
        console.log('   !!!! gmdmarDailyModOnline just kicked off.');
        let total = {};
        total.x = this.gmdmarDailyModsDates();
        total.y = this.gmdmarDailyModsOnline();
        total.type = 'bar';
        total.name = 'Online item updated or added';
        total.line = {width: 2};
        total.hoverinfo = "y+x";
        total.hoverlabel = this.hoverStyle;
        return total;
      },
      gmdmarDailyModsOnlineLayout() {
        console.log('   !!!! gmdmarDailyModOnlineLayout just kicked off.');
        let layout = {};
        layout.title = this.titles.modsOverTime.titles[0],
        layout.xaxis = this.lineLayout.xaxis,
        layout.yaxis = this.lineLayout.yaxis,
        layout.colorway = this.colorScheme.slice(1),
        layout.plot_bgcolor = '#e5ecf6';
        return layout;
      },
      gmdmarDailyModsOnlinePlotly(div) {
        console.log('   !!!! startDivC just kicked off.');
        let insertDiv = document.getElementById(div);
        Plotly.newPlot(
          insertDiv, 
          [this.gmdmarDailyModsOnlineTrace()],
          this.gmdmarDailyModsOnlineLayout(),
          this.config,
        );
      },
      //partOf collections
      mapPartOfCollections() {
        let partof = [];
        for (i = 0; i < this.rawData.mapPartOf.length; i++) {
          partof.push(this.rawData.mapPartOf[i].facet);
        };
        return partof;
      },
      mapPartOfOnline() {
        let partof = [];
          for (i = 0; i < this.rawData.mapPartOf.length; i++) {
            partof.push(this.rawData.mapPartOf[i].count);
          };
          return partof;
      },
      mapPartOfTrace() {
        console.log('   !!!! mapPartOfTrace just kicked off.');
        let total = {};
        total.x = this.mapPartOfCollections();
        total.y = this.mapPartOfOnline();
        total.type = 'bar';
        total.name = 'Map Collections Online';
        total.line = {width: 2};
        total.hoverinfo = "y+x";
        total.hoverlabel = this.hoverStyle;
        return total;      
      },
      mapPartOfLayout() {
        console.log('   !!!! mapPartOfLayout just kicked off.');
        let layout = {};
        layout.title = this.titles.facets.titles[0],
        layout.colorway = this.colorScheme.slice(1),
        layout.plot_bgcolor = '#e5ecf6';
        layout.margin = {};
        layout.margin.l = 15;
        layout.margin.r = 4;
        layout.xaxis = {showticklabels: false,zeroline: false,};
        layout.yaxis = {showticklabels: false,zeroline: false,};
        layout.plot_bgcolor = '#fff';
        return layout;
      },
      mapsPartOfPlotly() {
        console.log('   !!!! startDivI just kicked off.');
        let insertDiv = document.getElementById('graphDivI');
        Plotly.newPlot(
          insertDiv, 
          [this.mapPartOfTrace()],
          this.mapPartOfLayout(),
          this.config
        );
      },

    },
    mounted() { 
      console.log('   !!!! created just kicked off.');
      axios
        .get('https://reliztrent.github.io/loc-maps-dashboard/data/maps-online.json')
        .then(response => (this.rawData.mapOnline = response.data))
        .catch(err => console.error(err))
        .finally(() => {
          console.log('this.rawData.mapOnline just populated');
          this.mapOnlinePiePlotly('graphDivE');
          
        });  
      axios
        .get('https://reliztrent.github.io/loc-maps-dashboard/data/sanborn-online.json')
        .then(response => (this.rawData.sanbornOnline = response.data))
        .catch(err => console.error(err))
        .finally(() => {
          console.log('this.rawData.sanbornOnline just populated');
          this.sanbornOnlinePiePlotly('graphDivD');
        });     
      axios
        .get('https://reliztrent.github.io/loc-maps-dashboard/data/gmdmar-total-daily.json')
        .then(response => (this.rawData.gmdmarDailyTotals = response.data.sort(this.sortJson('facet'))))
        .catch(err => console.error(err))
        .finally(() => {
          console.log('this.rawData.gmdmarDailyTotals just populated');
          this.gmdmarDailyTotalsOnlinePlotly('graphDivA');
          this.dataPoints.sets.gmdmarOnline = this.dataPointsCalculator(
            this.gmdmarDailyTotalsOnline(), 
            this.gmdmarDailyTotalsDates(),
          );

          let red = document.getElementById('gmdmarOnline-fy21Decrease');
          let green = document.getElementById('gmdmarOnline-fy21Increase');
          if (this.dataPoints.sets.gmdmarOnline.fy21PercentIncrease < 0) {
            red.classList.remove("d-none")
          } else if (this.dataPoints.sets.gmdmarOnline.fy21PercentIncrease > 0) {       
            green.classList.remove("d-none")
          };

          let red2 = document.getElementById('gmdmarOnline-weekAgoDecrease');
          let green2 = document.getElementById('gmdmarOnline-weekAgoIncrease');
          console.log('this.dataPoints.sets.gmdmarOnline.weekAgoIncrease');
          console.log(this.dataPoints.sets.gmdmarOnline.weekAgoIncrease);
          console.log(this.dataPoints.sets.gmdmarOnline.weekAgoIncrease > 0);
          console.log(this.dataPoints.sets.gmdmarOnline.weekAgoIncrease < 0);
          console.log(this.dataPoints.sets.gmdmarOnline.weekAgoIncrease == 0);
          if (this.dataPoints.sets.gmdmarOnline.weekAgoIncrease < 0) {
            console.log('test');
            red2.classList.remove("d-none");
          } else if (this.dataPoints.sets.gmdmarOnline.weekAgoIncrease > 0) {       
            green2.classList.remove("d-none");
            console.log('test2');
            console.log(typeof this.dataPoints.sets.gmdmarOnline.thirtyDaysAgoIncrease);
            console.log(this.dataPoints.sets.gmdmarOnline.thirtyDaysAgoIncrease );
            console.log(this.dataPoints.sets.gmdmarOnline.thirtyDaysAgoIncrease == 0)
          };

          let red3 = document.getElementById('gmdmarOnline-thirtyDaysAgoIncrease');
          let green3 = document.getElementById('gmdmarOnline-thirtyDaysAgoIncrease');
          if (this.dataPoints.sets.gmdmarOnline.thirtyDaysAgoIncrease < 0) {
            console.log('test');
            red3.classList.remove("d-none");
          } else if (this.dataPoints.sets.gmdmarOnline.thirtyDaysAgoIncrease > 0) {       
            green3.classList.remove("d-none");
          };

        });
      axios
        .get('https://reliztrent.github.io/loc-maps-dashboard/data/sanborn-total-daily.json')
        .then(response => (this.rawData.sanbornDailyTotals = response.data.sort(this.sortJson('facet'))))
        .catch(err => console.error(err))
        .finally(() => {
          console.log('this.rawData.sanbornDailyTotals just populated');
          this.sanbornDailyTotalsOnlinePlotly('graphDivB');
          this.dataPoints.sets.sanbornsOnline = this.dataPointsCalculator(
            this.sanbornDailyTotalsOnline(), 
            this.sanbornDailyTotalsDates(),
          );

          let red = document.getElementById('sanbornsOnline-fy21Decrease');
          let green = document.getElementById('sanbornsOnline-fy21Increase');
          if (this.dataPoints.sets.sanbornsOnline.fy21PercentIncrease < 0) {
            red.classList.remove("d-none")
          } else if (this.dataPoints.sets.sanbornsOnline.fy21PercentIncrease > 0) {       
            green.classList.remove("d-none")
          };

          let red2 = document.getElementById('sanbornsOnline-weekAgoDecrease');
          let green2 = document.getElementById('sanbornsOnline-weekAgoIncrease');
          if (this.dataPoints.sets.sanbornsOnline.weekAgoIncrease < 0) {
            red2.classList.remove("d-none")
          } else if (this.dataPoints.sets.sanbornsOnline.weekAgoIncrease > 0) {       
            green2.classList.remove("d-none")
          };

          let red3 = document.getElementById('sanbornsOnline-thirtyDaysAgoDecrease');
          let green3 = document.getElementById('sanbornsOnline-thirtyDaysAgoIncrease');
          if (this.dataPoints.sets.sanbornsOnline.thirtyDaysAgoIncrease < 0) {
            red3.classList.remove("d-none")
          } else if (this.dataPoints.sets.sanbornsOnline.thirtyDaysAgoIncrease > 0) {       
            green3.classList.remove("d-none")
          };
        }); 
      axios
        .get('https://reliztrent.github.io/loc-maps-dashboard/data/maps-online-daily.json')
        .then(response => (this.rawData.mapDailyTotals = response.data.sort(this.sortJson('facet'))))
        .catch(err => console.error(err))
        .finally(() => {
          console.log('this.rawData.mapDailyTotals just populated');
          this.mapDailyTotalsOnlinePlotly('graphDivF');
          this.mapDailyTotalsBibsPlotly('graphDivG');
          this.dataPoints.sets.mapsOnline = this.dataPointsCalculator(
            this.mapDailyTotalsOnline(), 
            this.mapDailyTotalsDates(),
          );
          this.dataPoints.sets.bibsOnline = this.dataPointsCalculator(
            this.mapDailyTotalsBibs(),
            this.mapDailyTotalsDates(), 
          );

          let red = document.getElementById('bibsOnline-fy21Decrease');
          let green = document.getElementById('bibsOnline-fy21Increase');
          if (this.dataPoints.sets.bibsOnline.fy21PercentIncrease < 0) {
            red.classList.remove("d-none")
          } else if (this.dataPoints.sets.bibsOnline.fy21PercentIncrease > 0) {       
            green.classList.remove("d-none")
          };

          let red2 = document.getElementById('mapsOnline-fy21Decrease');
          let green2 = document.getElementById('mapsOnline-fy21Increase');
          if (this.dataPoints.sets.mapsOnline.fy21PercentIncrease < 0) {
            red2.classList.remove("d-none")
          } else if (this.dataPoints.sets.mapsOnline.fy21PercentIncrease > 0) {       
            green2.classList.remove("d-none")
          };

          let red4 = document.getElementById('mapsOnline-weekAgoDecrease');
          let green4 = document.getElementById('mapsOnline-weekAgoIncrease');
          if (this.dataPoints.sets.mapsOnline.weekAgoIncrease < 0) {
            red4.classList.remove("d-none")
          } else if (this.dataPoints.sets.mapsOnline.weekAgoIncrease > 0) {       
            green4.classList.remove("d-none")
          };

          let red5 = document.getElementById('mapsOnline-thirtyDaysAgoDecrease');
          let green5 = document.getElementById('mapsOnline-thirtyDaysAgoIncrease');
          if (this.dataPoints.sets.mapsOnline.thirtyDaysAgoIncrease < 0) {
            red5.classList.remove("d-none")
          } else if (this.dataPoints.sets.mapsOnline.thirtyDaysAgoIncrease > 0) {       
            green5.classList.remove("d-none")
          };

          let red6 = document.getElementById('bibsOnline-weekAgoDecrease');
          let green6 = document.getElementById('bibsOnline-weekAgoIncrease');
          if (this.dataPoints.sets.bibsOnline.weekAgoIncrease < 0) {
            red6.classList.remove("d-none")
          } else if (this.dataPoints.sets.bibsOnline.weekAgoIncrease > 0) {       
            green6.classList.remove("d-none")
          };

          let red7 = document.getElementById('bibsOnline-thirtyDaysAgoDecrease');
          let green7 = document.getElementById('bibsOnline-thirtyDaysAgoIncrease');
          if (this.dataPoints.sets.bibsOnline.thirtyDaysAgoIncrease < 0) {
            red7.classList.remove("d-none")
          } else if (this.dataPoints.sets.bibsOnline.thirtyDaysAgoIncrease > 0) {       
            green7.classList.remove("d-none")
          };
        }); 
      axios
        .get('https://reliztrent.github.io/loc-maps-dashboard/data/mod-gmdmar-daily.json')
        .then(response => (this.rawData.gmdmarDailyMods = response.data.sort(this.sortJson('facet'))))
        .catch(err => console.error(err))
        .finally(() => {
          console.log('this.rawData.gmdmarDailyMods just populated');
          this.gmdmarDailyModsOnlinePlotly('graphDivC');
        }); 
      axios
        .get('https://reliztrent.github.io/loc-maps-dashboard/data/all-facet-partof.json')
        .then(response => (this.rawData.mapPartOf = response.data))
        .catch(err => console.error(err))
        .finally(() => {
          console.log('this.rawData.mapPartOf just populated');
          this.mapsPartOfPlotly('graphDivI');
        }); 
      axios
        .get('https://reliztrent.github.io/loc-maps-dashboard/data/mod-gmdmar-list.json')
        .then(response => (this.rawData.gmdmarModList = response.data))
        .catch(err => console.error(err))
        .finally(() => {
          console.log('this.rawData.gmdmarModList just populated');
        }); 

        
        
    },

  });
  
  app.mount('#v-container');
  