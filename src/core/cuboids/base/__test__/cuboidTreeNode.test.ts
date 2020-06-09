import { CuboidTreeNode } from '../cuboidTreeNode';
import { DefaultMeasureTypes } from '../../../commons/measureFactory';

test('CuboidTreeNode', () => {
    const node = new CuboidTreeNode('lolita', ['style', 'price'], [DefaultMeasureTypes.sum, DefaultMeasureTypes.sum]);
    expect(node).toBeDefined();
    expect(node.id).toBe('lolita');
    expect(node.children).toBeInstanceOf(Map);
    expect(node.measureSet.measures.length).toBe(2);
})