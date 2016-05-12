import MetaModel = require("../metamodel")
import Sys = require("./systemTypes")

/**
 * Created by kor on 07/07/15.
 */
export class RAMLLanguageElement {

    //displayName:string
    //$displayName=[MetaModel.description("The displayName attribute specifies the $self's display name. It is a friendly name used only for display or documentation purposes. " +
    //"If displayName is not specified, it defaults to the element's key (the name of the property itself)."),MetaModel.thisFeatureCovers("https://github.com/raml-org/raml-spec/issues/136")]

    description:Sys.MarkdownString
    $description=[
      MetaModel.description("The description attribute describes the intended use or " +
      "meaning of the $self. This value MAY be formatted using Markdown.")
    ]
}

export class RAMLSimpleElement{}
