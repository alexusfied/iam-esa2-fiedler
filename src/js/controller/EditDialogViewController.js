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

        //const localReference = await fsHandler.createLocalFileSystemReference(imageFile);
//
        //mediaItem.src = await fsHandler.resolveLocalFileSystemReference(localReference);
        //if (!mediaItem.title) {
        //  mediaItem.title = localReference.replace("opfs://", "");
        //}
//
        //const tags = await ExifReader.load(imageFile, {expanded: true});
        //if (tags.exif && tags.exif.GPSLatitude && tags.exif.GPSLongitude) {
        //  mediaItem.latlng = {
        //    lat: tags.exif.GPSLatitude.description,
        //    lng: tags.exif.GPSLongitude.description
        //  };
        //} else {
        //  // Default location info, if the image doesn't contain the info in the metadata
        //  mediaItem.latlng = {
        //    lat: 52.416,
        //    lng: 12.55
        //  };
        //}

        this.viewProxy.update({item: mediaItem});
        mediaItem.src = await fsHandler.createLocalFileSystemReference(mediaItem.imgFile);
      }
    }));
  }
}