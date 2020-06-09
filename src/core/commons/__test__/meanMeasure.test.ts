import { MeanMeasure } from "../meanMeasure";
import { DefaultMeasureTypes } from "../measureFactory";

test("MeanMeasure constructor", () => {
    const measure = new MeanMeasure("age");
    expect(measure).not.toBeNull();
    expect(measure).toBeDefined();
    expect(measure.op).toBe(DefaultMeasureTypes.mean)
});

test("MeanMeasure init", () => {
    const measure = new MeanMeasure("age");
    measure.init();
    expect(measure.getState()).toEqual({
        sum: 0,
        count: 0
    });
});

test("MeanMeasure add", () => {
    const measure = new MeanMeasure("age");
    measure.init();
    let sum = 0;
    for (let i = 0; i < 10; i++) {
        const value = Math.round(Math.random() * 100);
        measure.aggregate(value);
        sum += value;
    }
    expect(measure.getState()).toEqual({
        sum,
        count: 10
    });
});

test("MeanMeasure add", () => {
    const measure = new MeanMeasure("age");
    measure.init();
    let sum = 0;
    for (let i = 0; i < 10; i++) {
        const value = Math.round(Math.random() * 100);
        measure.aggregate(value);
        sum += value;
    }
    expect(measure.serialize()).toBe(sum / 10);
});

test("MeanMeasure add dirty", () => {
    const measure = new MeanMeasure("age");
    measure.init();
    let sum = 0;
    for (let i = 0; i < 10; i++) {
        const value = Math.round(Math.random() * 100);
        measure.aggregate(value);
        sum += value;
    }
    measure.aggregate(undefined);
    measure.aggregate(null);
    // @ts-ignore
    measure.aggregate("190");
    // @ts-ignore
    measure.aggregate({});
    expect(measure.getState()).toEqual({
        sum,
        count: 10 + 4
    });
});
