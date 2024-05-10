

export const config = {
	logicalWidth: 720,
	logicalHeight: 1280,
	scaleFactor: 1,
	get topY()
	{
		return (window.innerHeight - (this.logicalHeight * this.scaleFactor))/2;
	},
	get bottomY()
	{
		return window.innerHeight - this.topX;
	},
	get leftX()
	{
		return (window.innerWidth - (this.logicalWidth * this.scaleFactor))/2;
	},
	get rightX()
	{
		return window.innerWidth - this.leftX;
	}
}