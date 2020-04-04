import { State, put } from "fp-ts/lib/State";

// Algebraic data types

type Container<A> = State<Array<A>, A>;


export interface Workspace {
  geometriesContainer: Container<Geometry>;
  manipulatorsContainer: Container<Manipulator>;
}

export interface Point {
  x: number;
  y: number;
}

const addGeometry = (workspace: Workspace) => (geometry: Geometry) => {};

interface Geometry {
  id: string;
  manipulator: Manipulator;
}

interface Manipulator {
  geometryId: string;
}
