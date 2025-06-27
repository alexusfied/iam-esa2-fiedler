/**
 * @author Jörn Kreutel
 */
import {mwf} from "vfh-iam-mwf-base";
import {mwfUtils} from "vfh-iam-mwf-base";
import * as entities from "../model/MyEntities.js";
import {LocalFileSystemReferenceHandler} from "../model/LocalFileSystemReferenceHandler";
import ExifReader from "exifreader";

export default class ListviewViewController extends mwf.ViewController {

    // instance attributes set by mwf after instantiation
    args;
    root;
    // TODO-REPEATED: declare custom instance attributes for this controller
    items;
    addNewMediaItemElement;

    /*
     * for any view: initialise the view
     */
    async oncreate() {
        // TODO: do databinding, set listeners, initialise the view
        this.addNewMediaItemElement = this.root.querySelector("#addNewMediaItem");

        this.root.querySelector("#allItemsFilter").checked = true;

        this.root.querySelectorAll('input[name="mediaItemFilter"]').forEach((mediaItemFilter) => {
            mediaItemFilter.addEventListener("change", (event) => {
                this.onMediaItemFilterChanged(event.target);
            });
        });

        this.addNewMediaItemElement.onclick = (() => {
            this.createNewItem();
        });

        this.items = await entities.MediaItem.readAll();
        this.initialiseListview(this.items);

        // call the superclass once creation is done
        super.oncreate();
    }


    constructor() {
        super();

        console.log("ListviewViewController()");
    }

    /*
     * for views that initiate transitions to other views
     * NOTE: return false if the view shall not be returned to, e.g. because we immediately want to display its previous view. Otherwise, do not return anything.
     */
    async onReturnFromNextView(nextviewid, returnValue, returnStatus) {
        // TODO: check from which view, and possibly with which status, we are returning, and handle returnValue accordingly
        if (nextviewid == "mediaReadview" && returnValue && returnValue.deletedItem) {
            this.removeFromListview(returnValue.deletedItem._id);
        }
    }

    /*
     * for views with listviews: react to the selection of a listitem menu option
     * TODO: delete if no listview is used or if item selection is specified by targetview/targetaction
     */
    onListItemMenuItemSelected(menuitemview, itemobj, listview) {
        // TODO: implement how selection of the option menuitemview for itemobj shall be handled
        super.onListItemMenuItemSelected(menuitemview, itemobj, listview);
    }

    /*
     * for views with dialogs
     * TODO: delete if no dialogs are used or if generic controller for dialogs is employed
     */
    bindDialog(dialogid, dialogview, dialogdataobj) {
        // call the supertype function
        super.bindDialog(dialogid, dialogview, dialogdataobj);

        // TODO: implement action bindings for dialog, accessing dialog.root
    }

    onMediaItemFilterChanged(targetRadioButton) {
        let filteredItems = [];

        if (targetRadioButton.id === "remoteItemsFilter") {
            filteredItems = this.items.filter((item) => item.remote);
        } else if (targetRadioButton.id === "localItemsFilter") {
            filteredItems = this.items.filter((item) => !item.remote);
        } else if (targetRadioButton.id === "allItemsFilter") {
            filteredItems = this.items;
        }

        this.initialiseListview(filteredItems);
    }

    // Returns the URL pointing to the location of the uploaded image
    async uploadImageToRemoteStorage(imgFile) {
        const uploadData = new FormData();
        const baseURL = "http://localhost:7077/";
        uploadData.append("imgdata", imgFile);

        const response = await fetch(baseURL + "api/upload", {
            method: "POST",
            body: uploadData
        });
        const responseData = await response.json();

        return baseURL + responseData.data.imgdata;
    }

    createNewItem() {
        const newItem = new entities.MediaItem("", "");
        this.showDialog("mediaItemDialog", {
            item: newItem,
            actionBindings: {
                submitForm: (async (event) => {
                    event.original.preventDefault();

                    if (newItem.remote) {
                        newItem.src = await this.uploadImageToRemoteStorage(newItem.imgFile);
                    } else {
                        const fsHandler = await LocalFileSystemReferenceHandler.getInstance();
                        newItem.src = await fsHandler.resolveLocalFileSystemReference(newItem.src);
                    }

                    const tags = await ExifReader.load(newItem.imgFile, {expanded: true});
                    if (tags.exif && tags.exif.GPSLatitude && tags.exif.GPSLongitude) {
                        newItem.latlng = {
                            lat: tags.exif.GPSLatitude.description,
                            lng: tags.exif.GPSLongitude.description
                        };
                    } else {
                        // Default location info, if the image doesn't contain the info in the metadata
                        newItem.latlng = {
                            lat: 52.416,
                            lng: 12.55
                        };
                    }

                    delete newItem.imgFile;
                    newItem.create().then(() => {
                        this.addToListview(newItem);
                    });
                    this.hideDialog();
                })
            }
        });
    }

    deleteItem(item) {
        this.showDialog("confirmDeletionDialog", {
            item: item,
            actionBindings: {
                onDeletionConfirmed: (() => {
                    item.delete().then(() => {
                        this.removeFromListview(item._id);
                        this.hideDialog();
                    });
                }),
                onDeletionCanceled: (() => {
                    this.hideDialog();
                })
            }
        });

    }

    editItem(item) {
        this.showDialog("mediaItemDialog", {
            item: item,
            actionBindings: {
                submitForm: (async (event) => {
                    event.original.preventDefault();

                    // This is not nice, because the image is always uploaded. There has to be a way to check if the
                    // image changed and only upload it in that case
                    if (item.remote) {
                        item.src = await this.uploadImageToRemoteStorage(item.imgFile);
                    }

                    item.update().then(() => {
                        this.updateInListview(item._id, item);
                    });
                    this.hideDialog();
                }),
                deleteItem: (() => {
                    this.deleteItem(item);
                    this.hideDialog();
                })
            }
        });
    }

}
