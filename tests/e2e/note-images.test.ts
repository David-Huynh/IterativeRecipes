/*
 * This file is part of Iterative Recipes.
 *
 * Originally created by Kent C. Dodds.
 * Copyright (C) 2024 David Huynh <david@dhuynh.ca>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import fs from 'fs'
import { faker } from '@faker-js/faker'
import { type NoteImage, type Note } from '@prisma/client'
import { prisma } from '#app/utils/db.server.ts'
import { expect, test } from '#tests/playwright-utils.ts'

test('Users can create note with an image', async ({ page, login }) => {
	const user = await login()
	await page.goto(`/users/${user.username}/notes`)

	const newNote = createNote()
	const altText = 'cute koala'
	await page.getByRole('link', { name: 'new note' }).click()

	// fill in form and submit
	await page.getByRole('textbox', { name: 'title' }).fill(newNote.title)
	await page.getByRole('textbox', { name: 'content' }).fill(newNote.content)
	await page
		.getByLabel('image')
		.nth(0)
		.setInputFiles('tests/fixtures/images/kody-notes/cute-koala.png')
	await page.getByRole('textbox', { name: 'alt text' }).fill(altText)

	await page.getByRole('button', { name: 'submit' }).click()
	await expect(page).toHaveURL(new RegExp(`/users/${user.username}/notes/.*`))
	await expect(page.getByRole('heading', { name: newNote.title })).toBeVisible()
	await expect(page.getByAltText(altText)).toBeVisible()
})

test('Users can create note with multiple images', async ({ page, login }) => {
	const user = await login()
	await page.goto(`/users/${user.username}/notes`)

	const newNote = createNote()
	const altText1 = 'cute koala'
	const altText2 = 'koala coder'
	await page.getByRole('link', { name: 'new note' }).click()

	// fill in form and submit
	await page.getByRole('textbox', { name: 'title' }).fill(newNote.title)
	await page.getByRole('textbox', { name: 'content' }).fill(newNote.content)
	await page
		.getByLabel('image')
		.nth(0)
		.setInputFiles('tests/fixtures/images/kody-notes/cute-koala.png')
	await page.getByLabel('alt text').nth(0).fill(altText1)
	await page.getByRole('button', { name: 'add image' }).click()

	await page
		.getByLabel('image')
		.nth(1)
		.setInputFiles('tests/fixtures/images/kody-notes/koala-coder.png')
	await page.getByLabel('alt text').nth(1).fill(altText2)

	await page.getByRole('button', { name: 'submit' }).click()
	await expect(page).toHaveURL(new RegExp(`/users/${user.username}/notes/.*`))
	await expect(page.getByRole('heading', { name: newNote.title })).toBeVisible()
	await expect(page.getByAltText(altText1)).toBeVisible()
	await expect(page.getByAltText(altText2)).toBeVisible()
})

test('Users can edit note image', async ({ page, login }) => {
	const user = await login()

	const note = await prisma.note.create({
		select: { id: true },
		data: {
			...createNoteWithImage(),
			ownerId: user.id,
		},
	})
	await page.goto(`/users/${user.username}/notes/${note.id}`)

	// edit the image
	await page.getByRole('link', { name: 'Edit', exact: true }).click()
	const updatedImage = {
		altText: 'koala coder',
		location: 'tests/fixtures/images/kody-notes/koala-coder.png',
	}
	await page.getByLabel('image').nth(0).setInputFiles(updatedImage.location)
	await page.getByLabel('alt text').nth(0).fill(updatedImage.altText)
	await page.getByRole('button', { name: 'submit' }).click()

	await expect(page).toHaveURL(new RegExp(`/users/${user.username}/notes/.*`))
	await expect(page.getByAltText(updatedImage.altText)).toBeVisible()
})

test('Users can delete note image', async ({ page, login }) => {
	const user = await login()

	const note = await prisma.note.create({
		select: { id: true, title: true },
		data: {
			...createNoteWithImage(),
			ownerId: user.id,
		},
	})
	await page.goto(`/users/${user.username}/notes/${note.id}`)

	await expect(page.getByRole('heading', { name: note.title })).toBeVisible()
	// find image tags
	const images = page
		.getByRole('main')
		.getByRole('list')
		.getByRole('listitem')
		.getByRole('img')
	const countBefore = await images.count()
	await page.getByRole('link', { name: 'Edit', exact: true }).click()
	await page.getByRole('button', { name: 'remove image' }).click()
	await page.getByRole('button', { name: 'submit' }).click()
	await expect(page).toHaveURL(new RegExp(`/users/${user.username}/notes/.*`))
	const countAfter = await images.count()
	expect(countAfter).toEqual(countBefore - 1)
})

function createNote() {
	return {
		title: faker.lorem.words(3),
		content: faker.lorem.paragraphs(3),
	} satisfies Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'type' | 'ownerId'>
}
function createNoteWithImage() {
	return {
		...createNote(),
		images: {
			create: {
				altText: 'cute koala',
				contentType: 'image/png',
				blob: fs.readFileSync(
					'tests/fixtures/images/kody-notes/cute-koala.png',
				),
			},
		},
	} satisfies Omit<
		Note,
		'id' | 'createdAt' | 'updatedAt' | 'type' | 'ownerId'
	> & {
		images: { create: Pick<NoteImage, 'altText' | 'blob' | 'contentType'> }
	}
}
