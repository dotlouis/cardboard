Card Board
=========

The default New Tab is not Google enough ? Try Cardboard, Now with more Material Design (plus nifty features)

[Google + page](https://plus.google.com/115967816314012668475/about)  

v2.0.0 screenshot
![Cardboard Material](https://i.imgur.com/ONHiF9q.png)

##Installation

*Warning: This is for development purpose and not the right way to get the extension for daily use. If you want the stable version head over the [Chrome Web Store](https://chrome.google.com/webstore/detail/card-board-new-tab-page/hilmkmopmiomkmehbhajigccnglobaap) and install it from here.*

1. `bower install`
2. open [chrome://extensions/](chrome://extensions/)
3. on top-right corner tick **Developer Mode**
4. Click Load unpack extension and choose the root cardboard folder

## Notes on permissions

- https://hawttrends.appspot.com/api/terms/: to get trends
- **downloads**: to display your recent downloads (can't be optional due to API/manifest limitation)
(see: http://developer.chrome.com/extensions/manifest.html)
- **downloads.open**: to open files you have downloaded from the download card (can't be optional)

- [Optional] **bookmarks**: to display your bookmarks
- [Optional] **management**: to display your apps
- [Optional] **topSites**: to display your most visited websites
