/**
 * Visualize the results of an API call to the FDA.
 */
component.visualization = function() {
  component.apply(this, arguments);
};
assessment.extend(component.visualization, component);

/**
 * Decorate.
 *
 * @param {HTMLDivElement} parent
 */
component.visualization.prototype.decorate = function(parent) {
  var self = this;
  var container = document.createElement('div');
  parent.appendChild(container);

  // Show basic loading text until the API call to the FDA completes.
  var loading = document.createElement('div');
  loading.innerText = 'Loading...';
  loading.setAttribute('id', 'loading');
  container.appendChild(loading);

  /**
   * Here are some other ideas:
   *
   * Route summary for all human prescription drugs
   * https://api.fda.gov/drug/label.json?search=openfda.product_type.exact:"HUMAN PRESCRIPTION DRUG"&count=openfda.route.exact
   *
   * Brand names for all drugs containing ibuprofen as an active ingredient
   * https://api.fda.gov/drug/label.json?search=active_ingredient:ibuprofen&count=openfda.brand_name.exact
   *
   * Routes for all drugs that treat headaches
   * https://api.fda.gov/drug/label.json?search=indications_and_usage:headache&count=openfda.route.exact
   *
   * Manufacturers of all congestion medications
   * https://api.fda.gov/drug/label.json?search=indications_and_usage:congestion&count=openfda.manufacturer_name.exact
   *
   * Substances contained in medications that have a warning for dizziness
   * https://api.fda.gov/drug/label.json?search=warnings:dizziness&count=openfda.substance_name.exact
   *
   * Frequency of boxed warning use over time
   * https://api.fda.gov/drug/label.json?search=effective_time:20090601+TO+20181008&count=effective_time
   * https://api.fda.gov/drug/label.json?search=(effective_time:20090601+TO+20181008)+AND+_exists_:boxed_warning&count=effective_time
   *
   * Frequency of the phrase "ice cream" in food recalls grouped by recalling company
   * https://api.fda.gov/food/enforcement.json?search=reason_for_recall:%22ice+cream%22&count=recalling_firm.exact
   * 
   * Using:
   * 'https://api.fda.gov/food/enforcement.json?search=report_date:[20000101+TO+20211231]&count=recalling_firm.exact&limit=150'
   */
  assessment.fda_api(
    'https://api.fda.gov/food/enforcement.json?search=report_date:[20000101+TO+20211231]&count=recalling_firm.exact&limit=150',
    function(data) {
      self.data = data;
      self.parent = container;
      self.decorate_data(container);
    }
  );
};

/**
 * TODO
 *
 * @param {HTMLElement} parent
 */
component.visualization.prototype.decorate_data = function(parent) {
  let self = this;
  let canvas = document.createElement('canvas');

  canvas.setAttribute('id', 'recalls');
  canvas.setAttribute('width', '400');
  canvas.setAttribute('height', '1000');


  let companies = [];
  let values = [];


  this.data.forEach(element => {
    let term = element.term;
    let count = element.count;

    companies.push(term);
    values.push(count);
  });

  const data = {
    labels: companies,
    datasets: [
      {
        label: 'Number of Recalls (2000-2021)',
        data: values,
        borderColor: '#FF00000',
        backgroundColor: '#FF000033',
        barThickness: 10,
      }
    ]
  }

  const config = {
    type: 'bar',
    data: data,
    options: {
      indexAxis: 'y',
      elements: {
        bar: {
          borderWidth: 1,
        }
      },
      responsive: true,
      plugins: {
        legend: {
          position: 'right',
        },
        title: {
          display: true,
          text: 'Recall Data (2000-2021)'
        }
      }
    }
  };

  const comp_data = function(company) {
    let recalls = document.getElementById('recalls');

    let classificationCanvas = document.createElement('canvas');
    classificationCanvas.setAttribute('id', 'classifications');
    canvas.setAttribute('width', '100');
    canvas.setAttribute('height', '100');

    let classificationLabels = [];
    let classificationCounts = [];
    let colors = [];

    self.data.forEach(element => {
      classificationCounts.push(element.count);

      switch(element.term) {
        case 'Class III':
          classificationLabels.push('Unlikely to cause adverse health reactions, but violate FDA labelling or manufacturing laws. (Class III)');
          colors.push('rgb(255, 205, 86)');
          break;
        case 'Class II':
          classificationLabels.push('Products may cause temporary health problems. (Class II)');
          colors.push('rgb(255, 205, 150)');
          break;
        case 'Class I':
          classificationLabels.push('Dangerous or defective products that could cause serious health problems or death. (Class I)');
          colors.push('rgb(255, 0, 0)');
          break;
        default:
          classificationLabels.push(`${element.term}`);
          colors.push('rgb(255, 0, 0)');
          break;
      }
    });

    const classificationData = {
      labels: classificationLabels,
      datasets: [{
        label: company+' Recall Classifications',
        data: classificationCounts,
        backgroundColor: colors,
        hoverOffset: 4,
      }]
    };

    const classConfig = {
      type: 'doughnut',
      data: classificationData,
      plugins: {
        legend: {
          position: 'right'
        },
        title: {
          display: true,
          text: company+' Recall Classifications'
        },
      }
    }

    let backButton = document.createElement('button');
    backButton.setAttribute('textContent', 'Back');
    backButton.setAttribute('id', 'back_button');
    backButton.textContent = 'Back';
    backButton.onclick = () => {
      self.parent.removeChild(classificationCanvas);
      self.parent.removeChild(document.getElementById('back_button'));
      self.parent.removeChild(document.getElementById('company'));
      self.parent.appendChild(recalls);
    }

    let companyLabel = document.createElement('h2');
    companyLabel.setAttribute('id', 'company');
    companyLabel.innerText = company;
    companyLabel.setAttribute('class', 'companyLabel');

    require(['./node_modules/chart.js/dist/chart.js'], (Chart) => {
      let newChart = new Chart(classificationCanvas, classConfig);
      self.parent.appendChild(backButton);
      self.parent.appendChild(companyLabel);
      self.parent.appendChild(classificationCanvas);
      self.parent.removeChild(recalls);
    });
  }

  require(['./node_modules/chart.js/dist/chart.js'], (Chart) => {
    let newChart = new Chart(canvas, config);
    parent.appendChild(canvas);
    parent.removeChild(document.getElementById('loading'));

    const clickHandler = (click) => {
      const points = newChart.getElementsAtEventForMode(click, 'nearest', {
        intersect: true,

      }, true);

      if(points.length) {
        const firstPoint  = points[0];
        const value = newChart.data.labels[firstPoint.index];

        assessment.fda_api(
          `https://api.fda.gov/food/enforcement.json?search=report_date:[20000101+TO+20211231]+AND+recalling_firm:%22${value}%22&count=classification.exact`,
          function (data) {
            self.data = data;
            comp_data(value);
          }
        );
      }
    }

    canvas.onclick = clickHandler;
  });
};