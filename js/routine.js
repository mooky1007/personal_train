class Routine {
    #routineData = {
        week1: {
            range: [
                [0, 5],
                [6, 10],
                [11, 20],
            ],
            day1: {
                restSecondEachSet: 60,
                sets: [
                    [2, 3, 2, 2, 3],
                    [6, 6, 4, 4, 5],
                    [10, 12, 7, 7, 9],
                ],
            },
            day2: {
                restSecondEachSet: 60,
                sets: [
                    [3, 4, 2, 3, 4],
                    [6, 8, 6, 6, 7],
                    [10, 12, 8, 8, 12],
                ],
            },
            day3: {
                restSecondEachSet: 60,
                sets: [
                    [4, 5, 4, 4, 5],
                    [8, 10, 7, 7, 10],
                    [11, 15, 9, 9, 13],
                ],
            },
        },
        week2: {
            range: [
                [0, 5],
                [6, 10],
                [11, 20],
            ],
            day1: {
                restSecondEachSet: 60,
                sets: [
                    [4, 6, 4, 4, 6],
                    [9, 11, 8, 8, 11],
                    [14, 14, 10, 10, 15],
                ],
            },
            day2: {
                restSecondEachSet: 90,
                sets: [
                    [5, 6, 4, 4, 7],
                    [10, 12, 9, 9, 13],
                    [14, 16, 12, 12, 17],
                ],
            },
            day3: {
                restSecondEachSet: 120,
                sets: [
                    [5, 7, 5, 5, 8],
                    [12, 13, 10, 10, 15],
                    [16, 17, 14, 14, 20],
                ],
            },
        },
        week3: {
            range: [
                [16, 20],
                [21, 25],
                [25, 30],
            ],
            day1: {
                restSecondEachSet: 60,
                sets: [
                    [10, 12, 7, 7, 9],
                    [12, 17, 13, 13, 17],
                    [14, 18, 14, 14, 20],
                ],
            },
            day2: {
                restSecondEachSet: 90,
                sets: [
                    [10, 12, 8, 8, 12],
                    [14, 19, 14, 14, 19],
                    [20, 25, 15, 15, 25],
                ],
            },
            day3: {
                restSecondEachSet: 120,
                sets: [
                    [11, 13, 9, 9, 13],
                    [16, 21, 15, 15, 21],
                    [22, 30, 20, 20, 28],
                ],
            },
        },
        week4: {
            range: [
                [16, 20],
                [21, 25],
                [25, 30],
            ],
            day1: {
                restSecondEachSet: 60,
                sets: [
                    [12, 14, 11, 10, 16],
                    [18, 22, 16, 16, 25],
                    [21, 25, 21, 21, 32],
                ],
            },
            day2: {
                restSecondEachSet: 90,
                sets: [
                    [14, 16, 12, 12, 18],
                    [20, 25, 20, 20, 28],
                    [25, 29, 25, 25, 36],
                ],
            },
            day3: {
                restSecondEachSet: 120,
                sets: [
                    [16, 18, 13, 13, 20],
                    [23, 28, 23, 23, 33],
                    [29, 33, 29, 29, 40],
                ],
            },
        },
        week5: {
            range: [
                [31, 35],
                [36, 40],
                [40, 45],
            ],
            day1: {
                restSecondEachSet: 60,
                sets: [
                    [17, 19, 15, 15, 20],
                    [28, 35, 25, 22, 35],
                    [36, 40, 30, 24, 40],
                ],
            },
            day2: {
                restSecondEachSet: 45,
                sets: [
                    [10, 10, 13, 13, 10, 10, 9, 25],
                    [18, 18, 20, 20, 14, 14, 16, 40],
                    [19, 19, 22, 22, 18, 18, 22, 45],
                ],
            },
            day3: {
                restSecondEachSet: 45,
                sets: [
                    [13, 13, 15, 15, 12, 12, 10, 30],
                    [18, 18, 20, 20, 17, 17, 20, 45],
                    [20, 20, 24, 24, 20, 20, 22, 50],
                ],
            },
        },
        week6: {
            range: [
                [46, 50],
                [51, 60],
                [60, 9999],
            ],
            day1: {
                restSecondEachSet: 60,
                sets: [
                    [25, 30, 20, 15, 40],
                    [40, 50, 25, 25, 50],
                    [45, 55, 35, 30, 55],
                ],
            },
            day2: {
                restSecondEachSet: 45,
                sets: [
                    [14, 14, 15, 15, 14, 14, 10, 10, 44],
                    [20, 20, 23, 23, 20, 20, 18, 18, 53],
                    [22, 22, 30, 30, 24, 24, 18, 18, 58],
                ],
            },
            day3: {
                restSecondEachSet: 45,
                sets: [
                    [13, 13, 17, 17, 16, 16, 14, 14, 50],
                    [22, 22, 30, 30, 25, 25, 18, 18, 55],
                    [26, 26, 33, 33, 26, 26, 22, 22, 60],
                ],
            },
        },
    };
    constructor(config = {}) {
        this.trainName = config.trainName || '';
        this.startDate = config.startDate || new Date();
        this.userMaxiumCount = config.userMaxiumCount || 0;
        this.week = config.week || 1;
        this.progress = config.progress || 0;

        this.init();
    }

    get today() {
        return new Date();
    }

    get week() {
        return this._week;
    }

    set week(value) {
        if (value === this._week) return;
        this._week = value;
        if (this._week > 6) return (this._week = 6);
        // console.log(`%c[${this.trainName}] ${value}주차(최대 ${this.userMaxiumCount}회)로 설정되었습니다!`, 'color: yellow');
    }

    dateFormat(date) {
        date = new Date(date);
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    }

    getDateDiff = (d1, d2) => {
        const date1 = new Date(d1);
        const date2 = new Date(d2);

        const diffDate = date1.getTime() - date2.getTime();

        return Math.abs(diffDate / (1000 * 60 * 60 * 24));
    };

    init() {
        this.week += Math.ceil(this.getDateDiff(this.today, this.startDate) / 7);
        const diffDay = Math.ceil(this.getDateDiff(this.today, this.startDate) % 7);
        this.progress += Math.ceil(diffDay / 2.5);

        this.setData = this.getSet()[this.progress];
    }

    getSet() {
        const { userMaxiumCount: count } = this;
        const data = this.#routineData[`week${this.week}`];
        const { range } = data;

        let rangeIdx;
        for (let i = 0; i < 3; i++) {
            let [min, max] = range[i];
            if (min <= count && count <= max) {
                rangeIdx = i;
                break;
            }
        }

        if (!rangeIdx) {
            if (count < range[0][0]) {
                this.week -= 1;
                return this.getSet();
            }
            if (range[0][1] < count) {
                this.week += 1;
                return this.getSet();
            }
        }

        return [
            { set: data.day1.sets[rangeIdx], restTime: data.day1.restSecondEachSet },
            { set: data.day2.sets[rangeIdx], restTime: data.day2.restSecondEachSet },
            { set: data.day3.sets[rangeIdx], restTime: data.day3.restSecondEachSet },
        ];
    }
}
