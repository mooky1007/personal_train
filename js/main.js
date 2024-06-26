class PersonalTrainApp {
    #todayOffset = 0;
    constructor() {
        this.userName = '';
        this.data = {};
        this.point = 0;

        this.userInfor = {
            age: null,
            weight: null,
            height: null,
            bodyFat: null,
            userInformuscle: null,
        };

        this.train = [
            {
                id: 'pushup',
                name: '푸쉬업',
                defaultCount: 15,
            },
            {
                id: 'pullup',
                name: '풀업',
                defaultCount: 5,
            },
            {
                id: 'squat',
                name: '스쿼트',
                defaultCount: 20,
            },
            {
                id: 'crunch',
                name: '크런치',
                defaultCount: 20,
            },
            {
                id: 'slow_buffytest',
                name: '슬로우버피',
                defaultCount: 20,
            },
        ];

        this.init();

        document.querySelector('#continuityCount').innerHTML = this.continuityDay;

        document.querySelector('.drop_row').addEventListener('click', (e) => {
            document.querySelector('.float_pannel').classList.remove('on');
        });

        document.querySelector('.up_btn').addEventListener('click', (e) => {
            document.querySelector('.float_pannel').classList.toggle('on');
            this.renderTrain();
        });

        document.querySelector('.my_data').addEventListener('click', (e) => {
            document.querySelector('.float_pannel').classList.toggle('on');
            this.renderInfor();
        });
    }

    get today() {
        let date = new Date();
        date.setDate(date.getDate() + this.#todayOffset);
        return `train_${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    }

    get continuityDay() {
        let date = new Date();
        let result = 1;

        while (true) {
            date.setDate(date.getDate() - 1);
            if (this.data[`train_${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`]) {
                result++;
            } else {
                break;
            }
        }

        return result;
    }

    get prevUserInfor() {
        const dataArr = Object.values(this.data).sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });
        const userInforArr = dataArr.filter((el) => el.userInfor);
        return userInforArr[1]?.userInfor || null;
    }

    init() {
        this.getTrainData();
        this.createTodayTrain();

        this.render();
    }

    getTrainData() {
        let data = window.localStorage.getItem('train');
        if (data) {
            data = JSON.parse(data);
            this.createTrainList(data.data);
            this.train = data.train;
            this.userName = data.userName;
            this.userInfor = data.userInfor || {
                age: null,
                weight: null,
                height: null,
                bodyFat: null,
                muscle: null,
            };
            this.point = data.point;
        }

        this.insertName();
    }

    insertName() {
        if (this.userName === '' || !this.userName || this.userName === 'null') {
            const name = window.prompt('이름을 입력해주세요.');
            if (!name || name === '') {
                this.insertName();
            } else {
                this.userName = name;
            }
        }

        document.querySelector('#username').innerHTML = this.userName;
    }

    save() {
        window.localStorage.setItem('train', JSON.stringify(this));
    }

    userInforSave() {
        this.data[this.today].userInfor = this.userInfor;
        this.data[this.today].render();
    }

    createTodayTrain() {
        if (!this.data[this.today]) {
            this.data[this.today] = new PersonalTrainDay({
                id: this.today,
                date: this.today.replace('train_', ''),
                trainList: {},
            });
        }

        this.save();
    }

    createTrainList(data = {}) {
        document.querySelector('main ul').innerHTML = '';
        const dataArr = Object.values(data).sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });

        dataArr.forEach((trainItem) => {
            if((!trainItem?.trainList || Object.keys(trainItem.trainList).length === 0) && trainItem.id !== this.today) return;
            // console.log(this.data[trainItem.id]);
            // console.log(this.data[trainItem.id].trainList);
            // console.log(this.data[trainItem.id].userInfor);
            this.data[trainItem.id] = new PersonalTrainDay(trainItem);
        });
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
            <input type="number" value=${this.userInfor.weight || 0}>
        `;

        const bodyfatBlock = document.createElement('div');
        bodyfatBlock.classList.add('row');
        bodyfatBlock.innerHTML = `
            <span class="title">체지방(%)</span>
            <input type="number" value=${this.userInfor.bodyFat || 0}>
        `;

        const muscleBlock = document.createElement('div');
        muscleBlock.classList.add('row');
        muscleBlock.innerHTML = `
            <span class="title">골격근량(kg)</span>
            <input type="number" value=${this.userInfor.muscle || 0}>
        `;

        const saveButton = document.createElement('div');
        saveButton.classList.add('row');
        saveButton.innerHTML = `
            <button>저장</button>
        `;
        saveButton.style.cssText = `margin-top: auto;`;

        saveButton.querySelector('button').style.cssText = `
          width: 100%;
          background: #fff;
          color: #333;
        `;

        saveButton.querySelector('button').addEventListener('click', () => {
            // this.userInfor.age = +ageBlock.querySelector('input').value;
            // this.userInfor.height = +heightBlock.querySelector('input').value;
            this.userInfor.weight = +weightBlock.querySelector('input').value;
            this.userInfor.bodyFat = +bodyfatBlock.querySelector('input').value;
            this.userInfor.muscle = +muscleBlock.querySelector('input').value;

            this.userInforSave();
            this.render();
            this.save();
        });

        document.querySelector('.float_pannel').append(weightBlock, bodyfatBlock, muscleBlock, saveButton);
    }

    renderTrain() {
        document.querySelectorAll('.float_pannel .row').forEach((el) => el.remove());
        this.train.forEach((train) => {
            const div = document.createElement('div');

            div.classList.add('row');
            const p = document.createElement('p');
            p.classList.add('title');
            p.innerText = `${train.name}`;

            div.append(p);

            const countArr = [1, 5, 10, 25];

            countArr.forEach((el) => {
                const button = document.createElement('button');
                button.setAttribute('type', 'button');
                button.innerHTML = `+${el}`;
                button.addEventListener('click', () => {
                    this.addValue(el, train);
                    document.querySelector('.point').innerHTML = `${this.point.toLocaleString()} point`;
                });

                div.append(button);
            });

            const button = document.createElement('button');
            button.setAttribute('type', 'button');
            button.classList.add('reset');
            button.innerHTML = `초기화`;
            button.addEventListener('click', () => {
                this.addValue(0, train);
                document.querySelector('.point').innerHTML = `${this.point.toLocaleString()} point`;
            });

            div.append(button);

            document.querySelector('.point').innerHTML = `${this.point.toLocaleString()} point`;
            document.querySelector('.float_pannel').append(div);
        });
    }

    render() {
        if (this.prevUserInfor && +this.userInfor.weight !== +this.prevUserInfor.weight) {
            const diff = +this.userInfor.weight - +this.prevUserInfor.weight;
            weight.innerHTML = `${this.userInfor.weight} kg
            <span class="sub_span">${
                diff > 0
                    ? `<i style="${diff > 0 ? 'color: #ff5252' : 'color: #51f375;'}" >▲</i> ${parseFloat(diff.toFixed(2))} kg`
                    : `<i style="${diff > 0 ? 'color: #ff5252' : 'color: #51f375;'}" >▼</i> ${parseFloat(Math.abs(diff).toFixed(2))} kg`
            }</span>`;
        } else {
            if (this.userInfor.weight) weight.innerHTML = parseFloat(this.userInfor.weight.toFixed(2)) + ' kg';
        }

        if (this.prevUserInfor && +this.userInfor.muscle !== +this.prevUserInfor.muscle) {
            const diff = +this.userInfor.muscle - +this.prevUserInfor.muscle;
            muscle.innerHTML = `${this.userInfor.muscle} kg
            <span class="sub_span">${
                diff > 0
                    ? `<i style="${diff > 0 ? 'color: #ff5252' : 'color: #51f375;'}" >▲</i> ${parseFloat(diff.toFixed(2))} kg`
                    : `<i style="${diff > 0 ? 'color: #ff5252' : 'color: #51f375;'}" >▼</i> ${parseFloat(Math.abs(diff).toFixed(2))} kg`
            }</span>`;
        } else {
            if (this.userInfor.muscle) muscle.innerHTML = parseFloat(this.userInfor.muscle.toFixed(2)) + ' kg';
        }

        if (this.prevUserInfor && +this.userInfor.bodyFat !== +this.prevUserInfor.bodyFat) {
            const diff = +this.userInfor.bodyFat - +this.prevUserInfor.bodyFat;
            bodyFat.innerHTML = `${this.userInfor.bodyFat} %
            <span class="sub_span">${
                diff > 0
                    ? `<i style="${diff > 0 ? 'color: #ff5252' : 'color: #51f375;'}" >▲</i> ${parseFloat(diff.toFixed(2))} %`
                    : `<i style="${diff > 0 ? 'color: #ff5252' : 'color: #51f375;'}" >▼</i> ${parseFloat(Math.abs(diff).toFixed(2))} %`
            }</span>`;
        } else {
            if (this.userInfor.bodyFat) bodyFat.innerHTML = parseFloat(this.userInfor.bodyFat.toFixed(2)) + ' %';
        }

        this.createTrainList(this.data);
    }

    addValue = (value, train) => {
        const count = +value;
        if (count === 0) {
            if (this.data[this.today].trainList[train.id]) {
                this.point -= this.data[this.today].trainList[train.id].count;
                delete this.data[this.today].trainList[train.id];
            }
            this.data[this.today].render();
            this.save();
            return;
        }

        if (this.data[this.today].trainList[train.id]) {
            this.data[this.today].trainList[train.id].count += +count;
            this.point += count;
        } else {
            this.data[this.today].trainList[train.id] = {
                id: train.id,
                name: train.name,
                count: +count,
                defaultCount: train.defaultCount,
            };
            this.point += count;
        }

        if (this.data[this.today].trainList[train.id].count > train.defaultCount) {
            train.defaultCount = this.data[this.today].trainList[train.id].count;
        }
        this.data[this.today].render();
        this.save();
    };
}

class PersonalTrainDay {
    constructor(config) {
        this.id = config.id;
        this.date = config.date || config.id.replace('train_', '');
        this.trainList = config.trainList;
        this.userInfor = config.userInfor || null;
        this.el = null;

        this.dateOption = {
            weekday: 'short',
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
        };

        this.render();
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
                    if (this.trainList[key].count > this.trainList[key].defaultCount) block.style.cssText = `color: yellow;`;
                    if (this.trainList[key].count === this.trainList[key].defaultCount) block.style.cssText = `color: #51f375;`;

                    block.innerHTML = `
                      <span class="train_name">[${this.trainList[key].name}]</span>
                      <span class="train_count">${this.trainList[key].count}개</span>
                      <span class="train_goal">${this.trainList[key].defaultCount}개</span>
                      <span class="gage">
                          <span class="gage_inner" style="width: ${(this.trainList[key].count / this.trainList[key].defaultCount) * 100}%"></span>
                      </span>
                  `;

                    this.el.append(block);
                });
            }

            if (this.userInfor) {
                const block = document.createElement('div');
                block.innerHTML = `
                  <div class="row" style="margin-top: 20px; gap: 15px;">
                    <p>
                        <span>체중</span>
                        <span>${this.userInfor.weight}</span>kg
                    </p>
                    <p>
                        <span>골격근량</span>
                        <span>${this.userInfor.muscle}</span>kg
                    </p>
                    <p>
                        <span>체지방</span>
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

            document.querySelector('main ul').append(li);
            this.render();
        }
    }
}

class PersonalTrainItem {
    constructor(config) {
        this.targetMuscle = config.targetMuscle;
        this.count = config.count;
    }
}
