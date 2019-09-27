import momentCube, { Node } from "../core/momentCube";
import { JsonRecord } from "../types";
interface Tree2TableProps {
    cube: momentCube;
    dimensions: string[];
    measures: string[];
}

function tree2Table(props: Tree2TableProps): JsonRecord[] {
    const { dimensions, measures, cube } = props;
    const aggFunc = cube.aggFunc;
    let table = [];
    function dfs(node: Node, record: JsonRecord, level: number) {
        if (node.children.size === 0) {
            let values = node._aggData;
            table.push({ ...record, ...values });
            return;
        }
        for (let [childName, child] of node.children.entries()) {
            let r = {
                ...record,
                [dimensions[level]]: childName
            };
            dfs(child, r, level + 1);
        }
    }
    dfs(cube.tree, {}, 0);
    return table;
}

export { tree2Table };
