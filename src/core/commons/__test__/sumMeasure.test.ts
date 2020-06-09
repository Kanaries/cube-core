import { SumMeasure } from "../sumMeasure";
import { DefaultMeasureTypes } from "../measureFactory";

test("SumMeasure constructor", () => {
    const measure = new SumMeasure("age");
    expect(measure).not.toBeNull();
    expect(measure).toBeDefined();
    expect(measure.op).toBe(DefaultMeasureTypes.sum);
});

test("SumMeasure init", () => {
    const measure = new SumMeasure("age");
    measure.init();
    expect(measure.getState()).toBe(0);
});

test("SumMeasure add", () => {
    const measure = new SumMeasure("age");
    measure.init();
    let sum = 0;
    for (let i = 0; i < 10; i++) {
        const value = Math.round(Math.random() * 100);
        measure.aggregate(value);
        sum += value;
    }
    expect(measure.getState()).toBe(sum);
});

test("SumMeasure add dirty", () => {
    const measure = new SumMeasure("age");
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
    measure.aggregate('190');
    // @ts-ignore
    measure.aggregate({})
    expect(measure.getState()).toBe(sum);
});
