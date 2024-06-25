class PersonalTrainApp {
    constructor() {
        this.userName = '';
        this.data = {};

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
        ];

        this.init();

        document.querySelector('#continuityCount').innerHTML = this.continuityDay;
    }

    get today() {
        let date = new Date();
        date.setDate(date.getDate());
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
        }

        this.insertName();
    }

    insertName() {
        if(this.userName === '' || !this.userName || this.userName === 'null'){
            const name = window.prompt('이름을 입력해주세요.');
            if(!name || name === ''){
                this.insertName();
            }else{
                this.userName = name;
            }
        }

        document.querySelector('#username').innerHTML = this.userName;
    }

    save() {
        window.localStorage.setItem('train', JSON.stringify(this));
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
        const dataArr = Object.values(data).sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });
        dataArr.forEach((trainItem) => {
            this.data[trainItem.id] = new PersonalTrainDay(trainItem);
        });
    }

    render() {
        this.train.forEach((train) => {
            const div = document.createElement('div');
            div.classList.add('row');
            const p = document.createElement('p');
            p.classList.add('title');
            p.innerText = train.name;

            div.append(p);

            const countArr = [1, 5, 10];

            countArr.forEach(el => {
                const button = document.createElement('button');
                button.setAttribute('type', 'button');
                button.innerHTML = `+${el}`;
                button.addEventListener('click', () => {this.addValue(el, train)})

                div.append(button);
            })

            document.querySelector('.overview').append(div);
        });
    }

    addValue = (value, train) => {
        const count = +value;
        if (this.data[this.today].trainList[train.id]) {
            this.data[this.today].trainList[train.id].count += +count;
        } else {
            this.data[this.today].trainList[train.id] = {
                id: train.id,
                name: train.name,
                count: +count,
                defaultCount: train.defaultCount,
            };
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
            if(Object.keys(this.trainList).length === 0){
                const block = document.createElement('div');
                block.classList.add('row');
                block.innerHTML = `<span class="no-data">오늘 운동기록이 없습니다.<span>`
                this.el.append(block);
            }

            Object.keys(this.trainList).forEach((key) => {
                const block = document.createElement('div');
                block.classList.add('row');
                if(this.trainList[key].count > this.trainList[key].defaultCount){
                    block.style.cssText = `color: yellow;`
                }

                block.innerHTML = `
                    <span class="train_name">[${this.trainList[key].name}]</span>
                    <span class="train_count">${this.trainList[key].count}개</span>
                    <span class="train_goal">${this.trainList[key].defaultCount}개</span>
                `;

                this.el.append(block);
            });
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
