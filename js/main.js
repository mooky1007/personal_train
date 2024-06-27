class PersonalTrainApp {
    #todayOffset = 0;
    #trainList = [
        { name: '푸쉬업', trainDay: [1, 3, 5], maximumCnt: 0 },
        { name: '풀업', trainDay: [2, 4, 6], maximumCnt: 0 },
        { name: '스쿼트', trainDay: [1, 3, 5], maximumCnt: 0 },
        { name: '크런치', trainDay: [1, 2, 3, 4, 5, 6], maximumCnt: 0 },
        { name: '슬로우버피', trainDay: [1, 2, 3, 4, 5, 6], maximumCnt: 0 },
    ];
    constructor() {
        this.userName = '';
        this.train = this.#trainList;
        this.sp = 0;
        this.routine = {};

        this.init();

        document.querySelectorAll('[data-js]').forEach((el) => {
            el.innerHTML = this[el.dataset.js];
        });

        this.train.forEach((train) => {
            this.routine[train.name] = new Routine({
                todayOffset: this.#todayOffset,
                startDate: this.routine[train.name]?.startDate,
                trainName: this.routine[train.name]?.trainName || train.name,
                userMaxiumCount: this.routine[train.name]?.userMaxiumCount || train.maximumCnt,
                progress: this.routine[train.name]?.progress,
            });
        });

        const maxLength = Math.max(...Object.values(this.routine).map((el) => el.setData.set.length));

        Object.values(this.routine).forEach((el) => {
            const table = document.querySelector('table');
            const thead = table.querySelector('thead');
            const tbody = table.querySelector('tbody');

            thead.innerHTML = `
              <tr>
                ${new Array(maxLength + 1)
                    .fill()
                    .map((el, idx) => {
                        return `<th>${idx === 0 ? '' : `Set ${idx}`}</th>`;
                    })
                    .join('')}
              </tr>
            `;

            const tr = document.createElement('tr');
            tr.innerHTML = `
            <td>${el.trainName}<br>휴식: ${el.setData.restTime}초</td>
            ${new Array(maxLength)
                .fill()
                .map((_, idx) => {
                    if (idx === el.setData.set.length - 1) return `<td>${el.setData.set[idx]} +</td>`;
                    return `<td>${el.setData.set[idx] || '-'}</td>`;
                })
                .join('')}`;

            tbody.append(tr);
        });
    }

    dateFormat(date) {
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    }

    get today() {
        const { dateFormat } = this;

        let date = new Date();
        date.setDate(date.getDate() + this.#todayOffset);
        return `train_${dateFormat(date)}`;
    }

    addTrain(train) {
        this.train.push(train);
    }

    get continuityDay() {
        const { data, dateFormat } = this;

        let date = new Date();
        let continuityDay = 1;

        while (true) {
            date.setDate(date.getDate() - 1);
            if (data[`train_${dateFormat(date)}`]) continuityDay++;
            else break;
        }

        return continuityDay;
    }

    controlBottomFloat(type) {
        document.querySelector('.float_pannel').classList.toggle('on');
        switch (type) {
            case 'train':
                this.renderTrain();
                break;
            case 'infor':
                this.renderInfor();
                break;
            default:
                document.querySelector('.float_pannel').classList.remove('on');
                break;
        }
    }

    get prevUserInfor() {
        const dataArr = Object.values(this.data).sort((a, b) => new Date(a.date) - new Date(b.date));
        const userInforArr = dataArr.filter((el) => el.userInfor);
        return userInforArr[1]?.userInfor || null;
    }

    async init() {
        this.userInfor = {
            age: null,
            weight: null,
            height: null,
            bodyFat: null,
            muscle: null,
        };
        
        this.getLocalData();
        await this.createTodayTrain();


        this.render();

        document.querySelector('#continuityCount').innerHTML = this.continuityDay;

        document.querySelector('.drop_row').addEventListener('click', (e) => {
            this.controlBottomFloat();
        });

        document.querySelector('.up_btn').addEventListener('click', () => {
            this.controlBottomFloat('train');
        });

        document.querySelector('.my_data').addEventListener('click', () => {
            this.controlBottomFloat('infor');
        });

        document.querySelector('#aside_open').addEventListener('click', () => {
            document.querySelector('body').classList.toggle('open');
            this.controlBottomFloat();
        });
    }

    getLocalData() {
        this.data = {};
        let data = window.localStorage.getItem('train');

        if (data) {
            data = JSON.parse(data);
            this.createTrainList(data.data);
            this.train = data.train;
            this.userName = data.userName;
            this.routine = data.routine || {};
            this.sp = +data?.sp || 0;
            this.userInfor = data.userInfor || {
                age: null,
                weight: null,
                height: null,
                bodyFat: null,
                muscle: null,
            };
        }

        this.insertName();
    }

    insertName() {
        if (!this.userName || this.userName === '' || this.userName === 'null') {
            const name = window.prompt('이름을 입력해주세요.');
            if (!name || name === '') this.insertName();
            else this.userName = name;
        }

        document.querySelector('#username').innerHTML = this.userName;
    }

    save() {
        const cloneApp = { ...this };
        delete cloneApp.chart;
        delete cloneApp.chart2;
        window.localStorage.setItem('train', JSON.stringify(cloneApp));
    }

    userInforSave() {
        this.data[this.today].userInfor = this.userInfor;
        this.data[this.today].render();
    }

    async createTodayTrain() {
        if (this.data[this.today]) return;

        await new Promise((resolve) => {
            const sortedData = Object.values(this.data).sort((a, b) => new Date(a.date) - new Date(b.date));
            const prevData = sortedData[sortedData.length - 1];
            if (prevData) {
                if (prevData.calculate) return resolve();

                this.data[prevData.id].calculate = true;
                const point = Object.values(prevData.trainList).reduce((acc, train) => {
                    if (train.count > train.defaultCount) {
                        acc += train.count - train.defaultCount;
                    }
                    return acc;
                }, 0);

                this.sp += point;
            }

            resolve();
        });

        let date = new Date();
        date.setDate(date.getDate() + this.#todayOffset);
        const todayNum = date.getDay();

        const newTrainConfig = {
            id: this.today,
            trainList: {},
        };

        this.train.forEach((train) => {
            if (train.trainDay.includes(todayNum)) {
                newTrainConfig.trainList[train.name] = {
                    ...train,
                    count: 0,
                    targetCount: this.routine[train.name].totalSet,
                    maximumCnt: 0,
                };
            }
        });

        this.data[this.today] = new PersonalTrainDay(newTrainConfig);
        this.save();
    }

    createTrainList(data = {}) {
        document.querySelector('main .data_list').innerHTML = '';
        const dataArr = Object.values(data).sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });

        dataArr.forEach((trainItem) => {
            this.data[trainItem.id] = new PersonalTrainDay(trainItem);
        });

        this.save();
    }

    renderInfor() {
        document.querySelectorAll('.float_pannel .row').forEach((el) => el.remove());

        // const ageBlock = document.createElement('div');
        // ageBlock.classList.add('row');
        // ageBlock.innerHTML = `
        //     <span class="title">나이</span>
        //     <input type="number" value=${this.userInfor.age || 0}>
        // `;

        // const heightBlock = document.createElement('div');
        // heightBlock.classList.add('row');
        // heightBlock.innerHTML = `
        //     <span class="title">신장(cm)</span>
        //     <input type="number" value=${this.userInfor.height || 0}>
        // `;

        const weightBlock = document.createElement('div');
        weightBlock.classList.add('row');
        weightBlock.innerHTML = `
            <span class="title">체중(kg)</span>
            <input type="number" value=${this.userInfor?.weight || 0}>
            <span>kg</span>
        `;

        const bodyfatBlock = document.createElement('div');
        bodyfatBlock.classList.add('row');
        bodyfatBlock.innerHTML = `
            <span class="title">체지방(%)</span>
            <input type="number" value=${this.userInfor?.bodyFat || 0}>
            <span>%</span>
        `;

        const muscleBlock = document.createElement('div');
        muscleBlock.classList.add('row');
        muscleBlock.innerHTML = `
            <span class="title">골격근(kg)</span>
            <input type="number" value=${this.userInfor?.muscle || 0}>
            <span>kg</span>
        `;

        const saveButton = document.createElement('div');
        saveButton.classList.add('row');
        saveButton.innerHTML = `
            <button>저장</button>
        `;
        saveButton.style.cssText = `margin-top: auto;`;

        saveButton.querySelector('button').style.cssText = `
          width: 100%;
          background: #000;
          color: #fff;
          margin-top: 20px;
        `;

        saveButton.querySelector('button').addEventListener('click', () => {
            // this.userInfor.age = +ageBlock.querySelector('input').value;
            // this.userInfor.height = +heightBlock.querySelector('input').value;
            if (+weightBlock.querySelector('input').value !== 0) this.userInfor.weight = +weightBlock.querySelector('input').value;
            if (+bodyfatBlock.querySelector('input').value !== 0) this.userInfor.bodyFat = +bodyfatBlock.querySelector('input').value;
            if (+muscleBlock.querySelector('input').value !== 0) this.userInfor.muscle = +muscleBlock.querySelector('input').value;

            this.userInforSave();
            this.render();
            this.save();

            this.controlBottomFloat();
        });

        document.querySelector('.float_pannel').append(weightBlock, muscleBlock, bodyfatBlock, saveButton);
    }

    renderTrain() {
        document.querySelectorAll('.float_pannel .row').forEach((el) => el.remove());
        Object.values(this.data[this.today].trainList).forEach((train) => {
            const div = document.createElement('div');

            div.classList.add('row');
            const p = document.createElement('p');
            p.classList.add('title');
            p.innerText = `${train.name}`;

            div.append(p);

            const countArr = [1, 5, 10, 25];

            const div2 = document.createElement('div');
            div2.classList.add('button_group');

            countArr.forEach((el) => {
                const button = document.createElement('button');
                button.setAttribute('type', 'button');
                button.innerHTML = `+${el}`;
                button.addEventListener('click', () => {
                    this.addValue(el, train);
                });

                div2.append(button);
            });

            const button = document.createElement('button');
            button.setAttribute('type', 'button');
            button.classList.add('reset');
            button.innerHTML = `초기화`;
            button.addEventListener('click', () => {
                this.addValue(0, train);
                this.renderChart();
            });

            div2.append(button);
            div.append(div2);

            document.querySelector('.float_pannel').append(div);
        });
    }

    render() {
        if (this.prevUserInfor && +this.userInfor.weight !== +this.prevUserInfor.weight) {
            const diff = +this.userInfor.weight - +this.prevUserInfor.weight;
            weight.innerHTML = `${this.userInfor.weight} kg
            <span class="sub_span">${
                diff > 0
                    ? `<i style="color: #ff5252;" >▲</i> ${parseFloat(diff.toFixed(2))} kg`
                    : `<i style="color: #51f375" >▼</i> ${parseFloat(Math.abs(diff).toFixed(2))} kg`
            }</span>`;
        } else {
            if (this.userInfor) if (this.userInfor.weight) weight.innerHTML = parseFloat(this.userInfor.weight.toFixed(2)) + ' kg';
        }

        if (this.prevUserInfor && +this.userInfor.muscle !== +this.prevUserInfor.muscle) {
            const diff = +this.userInfor.muscle - +this.prevUserInfor.muscle;
            muscle.innerHTML = `${this.userInfor.muscle} kg
            <span class="sub_span">${
                diff > 0
                    ? `<i style="color: #51f375;" >▲</i> ${parseFloat(diff.toFixed(2))} kg`
                    : `<i style="color: #ff5252" >▼</i> ${parseFloat(Math.abs(diff).toFixed(2))} kg`
            }</span>`;
        } else {
            if (this.userInfor) if (this.userInfor.muscle) muscle.innerHTML = parseFloat(this.userInfor.muscle.toFixed(2)) + ' kg';
        }

        if (this.prevUserInfor && +this.userInfor.bodyFat !== +this.prevUserInfor.bodyFat) {
            const diff = +this.userInfor.bodyFat - +this.prevUserInfor.bodyFat;
            bodyFat.innerHTML = `${this.userInfor.bodyFat} %
            <span class="sub_span">${
                diff > 0
                    ? `<i style="color: #ff5252;" >▲</i> ${parseFloat(diff.toFixed(2))} %`
                    : `<i style="color: #51f375" >▼</i> ${parseFloat(Math.abs(diff).toFixed(2))} %`
            }</span>`;
        } else {
            if (this.userInfor) if (this.userInfor.bodyFat) bodyFat.innerHTML = parseFloat(this.userInfor.bodyFat.toFixed(2)) + ' %';
        }

        document.querySelector('.today_goal ul').innerHTML = '';

        Object.values(this.data[this.today].trainList).forEach((trainItem) => {
            const li = document.createElement('li');
            const goalCheck =
                (this.data[this.today].trainList[trainItem.name]?.count || 0) >=
                (this.data[this.today].trainList[trainItem.name]?.targetCount || trainItem.targetCount);

            if (goalCheck) li.style.cssText = `color: #aaa`;
            li.innerHTML = `${trainItem.name}: ${this.data[this.today].trainList[trainItem.name]?.count || 0}/${
                this.data[this.today].trainList[trainItem.name]?.targetCount
            }회${goalCheck ? ` (완료)` : ''}`;
            document.querySelector('.today_goal ul').append(li);
        });

        this.renderChart();

        this.createTrainList(this.data);
    }

    renderChart() {
        const colors = ['#f35151', '#f3bf51', '#5188f3', '#8cf351', '#a851f3'];
        const skipped = (ctx, value) => (ctx.p0.skip || ctx.p1.skip ? value : undefined);

        if (this.chart) {
            this.chart.data.labels = [];

            this.train.forEach((el, idx) => {
                this.chart.data.datasets[idx] = {
                    label: el.name,
                    data: [],
                    barThickness: 10,
                    borderColor: colors[idx],
                    backgroundColor: colors[idx],
                    borderWidth: 1.5,
                    tension: 0.3,
                    radius: 2.5,
                    spanGaps: true,
                    segment: {
                        borderColor: (ctx) => skipped(ctx, `${colors[idx]}33`) || colors[idx],
                        borderDash: (ctx) => skipped(ctx, [5, 5]),
                    },
                };
            });

            [...Object.values(this.data)]
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .forEach((item) => {
                    this.chart.data.labels.push(
                        new Date(item.date).toLocaleDateString('ko-KR', {
                            month: 'numeric',
                            day: 'numeric',
                        })
                    );

                    this.chart.data.datasets.forEach((el) => {
                        const target = Object.values(item.trainList).find(({ name }) => name === el.label);
                        if (target) {
                            el.data.push(target.count);
                        } else {
                            el.data.push(null);
                        }
                    });
                });

            this.chart.update();
        }

        if (this.chart2) {
            this.chart2.data.labels = [];

            [
                { id: 'weight', name: '체중(kg)' },
                { id: 'muscle', name: '골격근(kg)' },
                { id: 'bodyFat', name: '체지방(%)' },
            ].forEach((el, idx) => {
                this.chart2.data.datasets[idx] = {
                    id: el.id,
                    label: el.name,
                    data: [],
                    barThickness: 10,
                    borderColor: colors[idx],
                    backgroundColor: colors[idx],
                    borderWidth: 1.5,
                    tension: 0.3,
                    radius: 2.5,
                    spanGaps: true,
                };
            });

            [...Object.values(this.data)]
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .forEach((item) => {
                    this.chart2.data.labels.push(
                        new Date(item.date).toLocaleDateString('ko-KR', {
                            month: 'numeric',
                            day: 'numeric',
                        })
                    );

                    this.chart2.data.datasets.forEach((el) => {
                        if (item.userInfor) {
                            const target = Object.keys(item.userInfor).find((key) => key === el.id);
                            if (target) {
                                el.data.push(item.userInfor[target]);
                            } else {
                                el.data.push(null);
                            }
                        } else {
                            el.data.push(null);
                        }
                    });
                });

            this.chart2.update();
        }
    }

    addValue = (value, train) => {
        const count = +value;
        if (count === 0) {
            if (this.data[this.today].trainList[train.name]) {
                delete this.data[this.today].trainList[train.name];
            }
            this.data[this.today].render();
            this.save();
            return;
        }

        this.data[this.today].trainList[train.name].count += +count;

        if (this.data[this.today].trainList[train.name].count >= train.targetCount) {
            const lastSetCount = this.routine[train.name].setData.set.slice(-1)[0];
            this.routine[train.name].userMaxiumCount = lastSetCount;
        }
        this.data[this.today].render();
        this.render();
        this.save();
    };
}

class PersonalTrainDay {
    #dateOption = {
        weekday: 'short',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    };
    constructor(config) {
        this.id = config.id;
        this.date = config.date || config.id.replace('train_', '');
        this.trainList = config.trainList || {};
        this.userInfor = config.userInfor || null;
        this.calculate = config.calculate || false;
        this.targetCount = config.calculate || 0;
        this.el = null;

        this.dateOption = this.#dateOption;

        this.dateOption = this.render();
    }

    render() {
        if (this.el) {
            this.el.innerHTML = '';
            const date = document.createElement('span');
            date.classList.add('date');
            date.innerHTML = `${new Date(this.date).toLocaleDateString('ko-KR', this.dateOption)}`;
            this.el.append(date);
            if (Object.keys(this.trainList).length === 0) {
                const block = document.createElement('div');
                block.classList.add('row');
                block.innerHTML = `<span class="no-data">운동기록이 없습니다.<span>`;
                this.el.append(block);
            } else {
                Object.keys(this.trainList).forEach((key) => {
                    const block = document.createElement('div');
                    block.classList.add('row');
                    block.innerHTML = `
                      <span class="train_name">[${this.trainList[key].name}]</span>
                      <span class="train_goal"><span
                        style="${this.trainList[key].count > this.trainList[key].targetCount ? 'color: yellow' : ''}"
                      >${this.trainList[key].count}</span>/${this.trainList[key].targetCount}회</span>
                      <span class="gage">
                          <span class="gage_inner" style="width: ${(this.trainList[key].count / this.trainList[key].targetCount) * 100}%"></span>
                      </span>
                  `;

                    this.el.append(block);
                });
            }

            if (this.userInfor) {
                const block = document.createElement('div');
                block.innerHTML = `
                  <div class="row" style="margin-top: 20px; gap: 15px; font-size: 10px;">
                    <p>
                        <span>체중 :</span>
                        <span>${this.userInfor.weight}</span>kg
                    </p>
                    <p>
                        <span>골격근 :</span>
                        <span>${this.userInfor.muscle}</span>kg
                    </p>
                    <p>
                        <span>체지방 :</span>
                        <span>${this.userInfor.bodyFat}</span>%
                    </p>
                </div>
              `;
                this.el.append(block);
            }
        } else {
            const li = document.createElement('li');
            li.id = this.id;
            li.classList.add('train_date_block');
            this.el = li;

            document.querySelector('main .data_list').append(li);
            this.render();
        }
    }
}
