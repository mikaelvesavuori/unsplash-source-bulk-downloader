#!/usr/bin/env node
const request = require('request');
const fs = require('fs');
const prompts = require('prompts');
const sharp = require('sharp');

const tempDir = `${process.cwd()}/temp`;
const imageDir = `${process.cwd()}/images`;

(async function() {
	const questions = [
		/*
		{
			type: 'text',
			name: 'content',
			message: `What content do you want?`,
			initial: 'random'
		},
		*/
		{
			type: 'text',
			name: 'size',
			message: 'What size dimensions do you need?',
			initial: '800x600'
		},
		{
			type: 'text',
			name: 'number',
			message: 'How many images do you need?',
			initial: 1
		}
	];

	await deleteFolderRecursive(imageDir);
	await createFolder(tempDir);
	await createFolder(imageDir);
	const answers = await prompts(questions);
	await downloadImages(answers);
})();

async function downloadImages(data) {
	let downloadedImages = 0;
	let images = [];

	for (let index = 0; index < data.number; index++) {
		const imageName = `image_${index}.jpeg`;
		images.push(imageName);
		// ${data.content}

		await request({
			uri: `https://source.unsplash.com/random/${data.size}?sig=${index}`
		}).pipe(
			fs.createWriteStream(`${tempDir}/${imageName}`).on('finish', function() {
				if (downloadedImages === data.number - 1) {
					optimizeImages(`${tempDir}`, images);
				}
				downloadedImages++;
			})
		);
	}
}

async function optimizeImages(dir, imageArray) {
	let counter = 0;
	imageArray.forEach((image, index) => {
		sharp(`${dir}/${image}`).toFile(`${imageDir}/${image}`, function(error, info) {
			if (index === imageArray.length - 1) {
				deleteFolderRecursive(tempDir);
			}
			counter++;
		});
	});
}

function deleteFolderRecursive(path) {
	if (fs.existsSync(path)) {
		fs.readdirSync(path).forEach(function(file, index) {
			const curPath = path + '/' + file;
			if (fs.lstatSync(curPath).isDirectory()) {
				deleteFolderRecursive(curPath);
			} else {
				fs.unlinkSync(curPath);
			}
		});
		fs.rmdirSync(path);
	}
}

async function createFolder(dir) {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}
}
