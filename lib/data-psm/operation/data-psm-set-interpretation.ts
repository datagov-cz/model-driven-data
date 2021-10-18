import {CoreResource, CoreOperation} from "../../core";

export class DataPsmSetInterpretation extends CoreOperation {

  static readonly TYPE = "data-psm-action-set-interpretation";

  dataPsmResource: string | null = null;

  dataPsmInterpretation: string | null = null;

  constructor() {
    super();
    this.types.push(DataPsmSetInterpretation.TYPE);
  }

  static is(
    resource: CoreResource | null,
  ): resource is DataPsmSetInterpretation {
    return resource?.types.includes(DataPsmSetInterpretation.TYPE);
  }

}
