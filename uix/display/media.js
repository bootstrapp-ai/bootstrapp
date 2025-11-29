export default {
	tag: "uix-media",
	connected() {
		this.addEventListener("click", (e) => {
			if (e.ctrlKey) {
				console.log({ this: this });
				APP.htmlToImage
					.toPng(this)
					.then((dataUrl) => {
						// 1. Open a blank tab immediately.
						const newTab = window.open("", "_blank");
						if (!newTab) {
							// If popups are blocked or the browser refused, handle gracefully here.
							console.warn("Unable to open new tab. Pop-up blocked?");
							return;
						}

						// 2. Write an <img> element into the new tab’s document.
						newTab.document.write(`
							<!DOCTYPE html>
							<html>
								<head>
									<title>Preview</title>
								</head>
								<body style="margin:0;">
									<img src="${dataUrl}" style="max-width:100%; max-height:100%;" />
								</body>
							</html>
						`);
						newTab.document.close();
					})
					.catch((err) => {
						console.error("Oops, something went wrong!", err);
					});
			}
		});
	},
};
