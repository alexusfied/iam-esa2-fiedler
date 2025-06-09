import {GenericDialogTemplateViewController} from "vfh-iam-mwf-base";

export default class EditDialogViewController extends GenericDialogTemplateViewController {
// instance attributes set by mwf after instantiation
  args;
  root;
  viewProxy;
// this methods need to be overridden
  async onresume() {
    console.log("ConfirmDeletionDialogViewController.onresume(): ", this.args, this.root);
    await super.onresume();

    var mediaItem = this.args.item;

    this.viewProxy = this.bindElement("confirmDeletionDialog", {
      item: mediaItem,
    }, this.root).viewProxy;
// ADD YOUR OWN IMPLEMENTATION HERE
  }
}