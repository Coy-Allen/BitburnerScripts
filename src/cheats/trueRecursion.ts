import {NS} from "@ns";
/* bitburner-src/src/Exploits/loops.ts
useEffect(() => {
	window.addEventListener("message", function (this: Window, ev: MessageEvent<boolean>) {
		if (ev.isTrusted && ev.origin == "https://bitburner-official.github.io" && ev.data) {
			Player.giveExploit(Exploit.TrueRecursion);
		}
	});
});
*/

/*
need to send the event from within the arcade iframe. for some reason didn't work when tried, both debug and .script
*/

export function main(_ns: NS) {
	window.postMessage("test");
}
