import { MeasureFactory, DefaultMeasureTypes } from "../measureFactory";

test("MeasureFactory", () => {
    const measure = MeasureFactory("age", DefaultMeasureTypes.sum);
    expect(measure).toBeDefined();
});
