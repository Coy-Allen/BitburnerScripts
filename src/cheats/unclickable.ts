import {NS} from "@ns";

/* bitburner-src/src/Exploits/Unclickable.tsx
const getComputedStyle = window.getComputedStyle;
export function Unclickable(): React.ReactElement {
	function unclickable(event: React.MouseEvent<HTMLDivElement>): void {
		if (!event.target || !(event.target instanceof Element)) return;
		const display = getComputedStyle(event.target).display;
		const visibility = getComputedStyle(event.target).visibility;
		if (display === "none" && visibility === "hidden" && event.isTrusted) Player.giveExploit(Exploit.Unclickable);
	}

	return (
		<div id="unclickable" onClick={unclickable} style={{ display: "none", visibility: "hidden" }}>
			Click on this to upgrade your Source-File -1!
		</div>
	);
}
*/

/*
IDEA: make visable then add another listener that changes its display/visability back before first event fires.
NOPE: cant add listeners before already existing ones. cant repush the event
*/

export function main(_ns: NS) {
	const element = window.document.getElementById("unclickable");
	if (element === null) {
		console.error("unclickable not found.");
		return;
	}
	element.style.display="none";
	element.style.visibility="hidden";
	// fails as it's not trusted
	element.dispatchEvent(new Event("click"));
}
