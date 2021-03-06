#Location of your add-on sdk folder
# See https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Installation
SDKHOME=~/addon-sdk-1.16
DEV=false
BUNDLEFILE=bundle.min.js
BUNDLECMD=gulp lint && gulp test && gulp bundle

#If dev is true, use unminified bundle
#and don't worry about lint/test for quicker dev cycle
#run at CLI with args 'make DEV=true'
ifeq ($(DEV),true)
	BUNDLEFILE=bundle.js
	BUNDLECMD=gulp bundle
endif

all: package

package: pkg-chrome pkg-firefox

pkg-chrome: cpy-chrome
	mkdir -p dist/packaged
	cd dist/chrome; zip -r ../packaged/video-vr-chrome.zip *

pkg-firefox: cpy-firefox
	mkdir -p dist/packaged
	cd $(SDKHOME); source bin/activate; cd -; cd dist/firefox; cfx xpi
	mv dist/firefox/vr-video.xpi dist/packaged

cpy-chrome: bundle
	mkdir -p dist/chrome/video-js/
	cp -r libs/video-js-4.4.3/ dist/chrome/video-js/
	rsync -aP ./src/chrome/* ./dist/chrome/
	cp dist/assets/$(BUNDLEFILE) dist/chrome/bundle.js
	cp src/shared/js/poll.js dist/chrome

cpy-firefox: bundle
	mkdir -p dist/firefox/data
	cp -r libs/video-js-4.4.3/ dist/firefox/data/video-js/
	rsync -aP ./src/firefox/* ./dist/firefox/
	cp dist/assets/$(BUNDLEFILE) dist/firefox/data/bundle.js
	cp src/shared/js/poll.js dist/firefox/data

bundle:
	$(BUNDLECMD)

#The following targets are convenient for dev purposes
#Requires autoinstall firefox extension
# See https://addons.mozilla.org/en-US/firefox/addon/autoinstaller/
dev-firefox: pkg-firefox
	wget --post-file=dist/packaged/vr-video.xpi http://localhost:8888/

run-firefox:
	cd $(SDKHOME); source bin/activate; cd -; cd dist/firefox; cfx run

dev-chrome: pkg-chrome

clean:
	rm -r dist
