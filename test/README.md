🚨 Note: this folder is intended for test-related meta-files (such as test configs, setup/teardown files, etc.), but _not_ for the testing files themselves (`*.ts` / `*.spec.ts`).

***

The testing files should be placed in `/src` folder:
- **unit tests** – next to the subject modules:

	```yaml
	/src/
		router/
			users/
				# subject unit
				router.ts
				# test
				router.unit.ts
	```

- **integration tests** – directly in `/src`:

	```yaml
	/src/
		db/
			models/
				# subject unit #1
				user.ts
		router/
			users/
				# subject unit #2
				router.ts
		services/
			# subject unit #3
			user.service.ts
		# test
		get-user-by-id.integration.ts
	```
