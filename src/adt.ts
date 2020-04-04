import { State, put } from "fp-ts/lib/State";

type Container<A> = State<Array<A>, A>;

interface Workspace {
  geometriesContainer: Container<Geometry>;
  manipulatorsContainer: Container<Manipulator>;
}

const addGeometry = (workspace: Workspace) => (geometry: Geometry) => {};

interface Geometry {
  id: string;
  manipulator: Manipulator;
}

interface Manipulator {
  geometryId: string;
}
