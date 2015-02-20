Card Board
=========

The default New Tab is not Google enough ? Try Cardboard, Now with more Material Design (plus nifty features)

[Google + page](https://plus.google.com/115967816314012668475/about)  

v2.0-beta1 screenshot (pre-release)
![Cardboard Material](https://cloud.githubusercontent.com/assets/1891109/6308652/561febf4-b946-11e4-8829-c470f0efe59e.png)

##Pre-release

If you're feeling adventurous you can install the pre-release version (2.0-beta.1)

Just head over to [the release page](https://github.com/virtual-dev/cardboard/releases/tag/v2.0-beta.1), go to the Download section and click on **cardboard.crx** to download the packaged extension.

Now go to your chrome://extensions/ page.
Drag and drop the .crx into the page to install the extension.
It will not override the current version so you can easily disable/uninstall it.

##Installation

*Warning: This is for development purpose and not the right way to get the extension for daily use. If you want the stable version head over the [Chrome Web Store](https://chrome.google.com/webstore/detail/card-board-new-tab-page/hilmkmopmiomkmehbhajigccnglobaap) and install it from here.*

1. `bower install`
2. open [chrome://extensions/](chrome://extensions/)
3. on top-right corner tick **Developer Mode**
4. Click Load unpack extension and choose the root cardboard folder

## Notes on permissions

*Some of theses permissions are not optional only due to manifest/API limitations: [learn more](https://developer.chrome.com/extensions/permissions)*

- **storage**: to save user's settings such as background image
- **sessions**: to retreive chrome sessions linked to your account and display them in a card
- **browsingData**: to allow the quick-settings card to remove your cache, cookies, history and local storage
- **downloads**: to display your recent downloads
- **downloads.open**: to open files you have downloaded from the download card
- **system.cpu**: to collect and display your computer's cpu usage
- **system.memory**: to collect and display your computer's memory usage
- **system.storage**: to collect and display your computer's storage usage
- **https://hawttrends.appspot.com/api/terms/**: to fetch google trends at this adress
- [Optional] **tabs**: to show your recently closed tabs (session card)
- [Optional] **topSites**: to display your most visited websites
- [Optional] **bookmarks**: to display your bookmarks
- [Optional] **management**: to display your apps
- [Optional] **history**: to display your history
