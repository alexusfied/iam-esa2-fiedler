import {GenericDialogTemplateViewController} from "vfh-iam-mwf-base";

export default class EditDialogViewController extends GenericDialogTemplateViewController {
// instance attributes set by mwf after instantiation
  args;
  root;
  viewProxy;
// this methods need to be overridden
  async onresume() {
    console.log("EditDialogViewController.onresume(): ", this.args, this.root);
    await super.onresume();

    var mediaItem = this.args.item;

    this.viewProxy = this.bindElement("mediaItemDialog", {
      item: mediaItem,
    }, this.root).viewProxy;

    this.viewProxy.bindAction("fileSelected", ((event) => {
      event.original.preventDefault();
      if (event.original.target.files[0]) {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(event.original.target.files[0]);
        fileReader.onload = () => {
          mediaItem.src = fileReader.result;
          this.viewProxy.update({item: mediaItem});
        };
      }
    }));
// ADD YOUR OWN IMPLEMENTATION HERE
  }
}