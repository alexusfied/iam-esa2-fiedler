import {GenericDialogTemplateViewController} from "vfh-iam-mwf-base";
import ExifReader from "exifreader";
import {LocalFileSystemReferenceHandler} from "../model/LocalFileSystemReferenceHandler";

export default class EditDialogViewController extends GenericDialogTemplateViewController {
// instance attributes set by mwf after instantiation
  args;
  root;
  viewProxy;
// this methods need to be overridden
  async onresume() {
    console.log("EditDialogViewController.onresume(): ", this.args, this.root);
    await super.onresume();

    const mediaItem = this.args.item;
    const fsHandler = await LocalFileSystemReferenceHandler.getInstance();

    this.viewProxy = this.bindElement("mediaItemDialog", {
      item: mediaItem,
    }, this.root).viewProxy;

    this.viewProxy.bindAction("fileSelected", (async (event) => {
      event.original.preventDefault();
      if (event.original.target.files[0]) {
        mediaItem.imgFile = event.original.target.files[0];
        mediaItem.src = URL.createObjectURL(mediaItem.imgFile);

        if (!mediaItem.title) {
          mediaItem.title = mediaItem.imgFile.name;
        }
        this.viewProxy.update({item: mediaItem});
        mediaItem.src = await fsHandler.createLocalFileSystemReference(mediaItem.imgFile);
      }
    }));
  }
}