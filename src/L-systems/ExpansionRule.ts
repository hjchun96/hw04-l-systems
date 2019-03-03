
export default class ExpansionRule {
  // precondition: string;
  branch_expansions: Map<number, string> = new Map();
  leaves_expansions: Map<number, string> = new Map();

  constructor(branch_expansions: Map<number, string>, leaves_expansions: Map<number, string>) {
    // this.precondition = prevChar;
    this.branch_expansions = branch_expansions;
    this.leaves_expansions = leaves_expansions;
  }

  expand_branch() : string {
    console.log("IN HERE");
    let rand = Math.random(); // set range?
    console.log(rand);
    if (rand < 0.25) {
      return this.branch_expansions.get(0.2);
    } else if (rand < 0.5) {
      return this.branch_expansions.get(0.4);
    } else if (rand < 0.75) {
      return this.branch_expansions.get(0.6);
    } else  {
      return this.branch_expansions.get(0.8);
    }
  }

  expand_leaves() : string {
    return this.leaves_expansions.get(0.0);
  }
}
