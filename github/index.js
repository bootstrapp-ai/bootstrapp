import $APP from "/$app.js";

const GITHUB_API_URL = "https://api.github.com";
const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

// Helper function to convert a Blob to a Base64 string
const blobToBase64 = (blob) =>
	new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => {
			// The result is a data URL: "data:mime/type;base64,the_base64_string"
			// We only need the base64 part for the GitHub API.
			const base64String = reader.result.split(",")[1];
			resolve(base64String);
		};
		reader.onerror = reject;
		reader.readAsDataURL(blob);
	});

// New helper function to make GraphQL API calls
const _callGraphQL = async (query, variables, token) => {
	const headers = {
		Authorization: `Bearer ${token}`,
		"Content-Type": "application/json",
		Accept: "application/json",
	};

	const response = await fetch(GITHUB_GRAPHQL_URL, {
		method: "POST",
		headers,
		body: JSON.stringify({
			query,
			variables,
		}),
	});

	const data = await response.json();

	if (!response.ok || data.errors) {
		const errorMessage = data.errors
			? data.errors.map((e) => e.message).join("\n")
			: `GraphQL request failed with status ${response.status}`;
		throw new Error(errorMessage);
	}

	return data.data;
};

const ensureRepoExists = async ({ owner, repo, token }) => {
	const headers = {
		Authorization: `Bearer ${token}`,
		Accept: "application/vnd.github.v3+json",
		"Content-Type": "application/json",
	};

	const repoUrl = `${GITHUB_API_URL}/repos/${owner}/${repo}`;
	const repoCheckResponse = await fetch(repoUrl, { headers });

	if (repoCheckResponse.ok) {
		console.log(`Repository ${owner}/${repo} already exists.`);
		return;
	}

	if (repoCheckResponse.status === 404) {
		console.log(
			`Repository ${owner}/${repo} not found. Creating it with auto-init...`,
		);

		const userUrl = `${GITHUB_API_URL}/users/${owner}`;
		const userCheckResponse = await fetch(userUrl, { headers });

		if (!userCheckResponse.ok) {
			throw new Error(
				`Failed to check owner type for '${owner}'. Status: ${userCheckResponse.status}`,
			);
		}

		const userData = await userCheckResponse.json();
		const ownerType = userData.type;

		const createUrl =
			ownerType === "Organization"
				? `${GITHUB_API_URL}/orgs/${owner}/repos`
				: `${GITHUB_API_URL}/user/repos`;

		const createResponse = await fetch(createUrl, {
			method: "POST",
			headers,
			body: JSON.stringify({
				name: repo,
				auto_init: true,
			}),
		});

		if (!createResponse.ok) {
			const errorData = await createResponse.json();
			throw new Error(`Failed to create repository: ${errorData.message}`);
		}

		console.log(
			`✅ Successfully created and initialized repository ${owner}/${repo}.`,
		);

		await new Promise((resolve) => setTimeout(resolve, 2000));
	} else {
		const errorData = await repoCheckResponse.json();
		throw new Error(`Failed to check for repository: ${errorData.message}`);
	}
};

const deploy = async ({ owner, repo, branch = "main", token, files }) => {
	console.log("Starting Deploy to Github", { owner, repo });

	await ensureRepoExists({ owner, repo, token });

	const headers = {
		Authorization: `Bearer ${token}`,
		Accept: "application/vnd.github.v3+json",
		"Content-Type": "application/json",
	};

	const latestCommitSha = await getLatestCommitSha(
		owner,
		repo,
		branch,
		headers,
	);

	const blobs = await Promise.all(
		files.map((file) => createBlob(owner, repo, file, headers)),
	);

	const baseTreeSha = await getBaseTreeSha(
		owner,
		repo,
		latestCommitSha,
		headers,
	);

	const newTree = await createTree(
		owner,
		repo,
		baseTreeSha,
		files,
		blobs,
		headers,
	);

	const newCommitSha = await createCommit(
		owner,
		repo,
		latestCommitSha,
		newTree.sha,
		headers,
	);

	await updateBranch(owner, repo, branch, newCommitSha, headers);

	console.log("Deployment to GitHub successful");
};

const createTree = async (owner, repo, baseTreeSha, files, blobs, headers) => {
	const tree = files.map((file, index) => ({
		path: file.path,
		mode: "100644",
		type: "blob",
		sha: blobs[index],
	}));

	const payload = { tree };
	if (baseTreeSha) {
		payload.base_tree = baseTreeSha;
	}

	const response = await fetch(
		`${GITHUB_API_URL}/repos/${owner}/${repo}/git/trees`,
		{
			method: "POST",
			headers,
			body: JSON.stringify(payload),
		},
	);
	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(`Failed to create tree: ${errorData.message}`);
	}
	return response.json();
};

const createBlob = async (owner, repo, file, headers) => {
	const { content } = file;
	let payload;

	if (content instanceof Blob) {
		const base64Content = await blobToBase64(content);
		payload = { encoding: "base64", content: base64Content };
	} else {
		payload = { encoding: "utf-8", content: content ?? "" };
	}

	const response = await fetch(
		`${GITHUB_API_URL}/repos/${owner}/${repo}/git/blobs`,
		{
			method: "POST",
			headers,
			body: JSON.stringify(payload),
		},
	);

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(
			`Failed to create blob for ${file.path}: ${errorData.message}`,
		);
	}
	const data = await response.json();
	return data.sha;
};

const getLatestCommitSha = async (owner, repo, branch, headers) => {
	const response = await fetch(
		`${GITHUB_API_URL}/repos/${owner}/${repo}/git/ref/heads/${branch}`,
		{
			method: "GET",
			headers,
		},
	);

	if (response.status === 404) {
		// This is now an explicit error because auto-init creates a default branch.
		// If the user wants a different branch, they should create it on GitHub first.
		throw new Error(
			`Branch '${branch}' not found in repository '${owner}/${repo}'. Please create it first.`,
		);
	}

	const data = await response.json();
	if (!response.ok) {
		throw new Error(data.message || "Could not get latest commit SHA.");
	}

	return data.object.sha;
};

const getBaseTreeSha = async (owner, repo, commitSha, headers) => {
	const response = await fetch(
		`${GITHUB_API_URL}/repos/${owner}/${repo}/git/commits/${commitSha}`,
		{
			method: "GET",
			headers,
		},
	);
	const data = await response.json();
	return data.tree.sha;
};

const createCommit = async (owner, repo, parentSha, treeSha, headers) => {
	const body = {
		message: "Deploying generated files",
		parents: parentSha ? [parentSha] : [],
		tree: treeSha,
	};
	const response = await fetch(
		`${GITHUB_API_URL}/repos/${owner}/${repo}/git/commits`,
		{
			method: "POST",
			headers,
			body: JSON.stringify(body),
		},
	);
	const data = await response.json();
	return data.sha;
};

const updateBranch = async (owner, repo, branch, commitSha, headers) => {
	await fetch(
		`${GITHUB_API_URL}/repos/${owner}/${repo}/git/refs/heads/${branch}`,
		{
			method: "PATCH",
			headers,
			body: JSON.stringify({
				sha: commitSha,
			}),
		},
	);
};

const createBranch = async (owner, repo, branch, commitSha, headers) => {
	await fetch(`${GITHUB_API_URL}/repos/${owner}/${repo}/git/refs`, {
		method: "POST",
		headers,
		body: JSON.stringify({
			ref: `refs/heads/${branch}`,
			sha: commitSha,
			force: true,
		}),
	});
};

const ensureDiscussionExists = async ({
	owner,
	repo,
	token,
	categoryName = "announcements",
	title,
	body,
}) => {
	console.log(
		`Checking for discussion titled "${title}" in category "${categoryName}"...`,
	);

	const searchQuery = `repo:${owner}/${repo} is:discussion category:"${categoryName}" in:title "${title}"`;

	const findQuery = `
        query FindDiscussionAndIds($owner: String!, $repo: String!, $categoryName: String!, $searchQuery: String!) {
          repository(owner: $owner, name: $repo) {
            id
            discussionCategory(slug: $categoryName) {
              id
            }
          }
          search(query: $searchQuery, type: DISCUSSION, first: 1) {
            discussionCount
          }
        }`;

	const findResult = await _callGraphQL(
		findQuery,
		{ owner, repo, categoryName, searchQuery },
		token,
	);

	if (findResult.search.discussionCount > 0) {
		console.log(
			"Discussion with the same title already exists. Skipping creation.",
		);
		return;
	}

	console.log("Discussion not found. Creating a new one...");

	const { repository } = findResult;
	if (!repository) {
		throw new Error(`Repository ${owner}/${repo} not found.`);
	}
	const category = repository.discussionCategory;
	if (!category) {
		throw new Error(
			`Discussion category "${categoryName}" not found in ${owner}/${repo}.`,
		);
	}

	const createMutation = `
        mutation CreateDiscussion($repoId: ID!, $catId: ID!, $title: String!, $body: String!) {
            createDiscussion(input: {
                repositoryId: $repoId,
                categoryId: $catId,
                title: $title,
                body: $body
            }) {
                discussion {
                    url
                }
            }
        }`;

	const createResult = await _callGraphQL(
		createMutation,
		{
			repoId: repository.id,
			catId: category.id,
			title,
			body,
		},
		token,
	);

	const newDiscussionUrl = createResult.createDiscussion.discussion.url;
	console.log(`✅ Successfully created new discussion: ${newDiscussionUrl}`);
};

$APP.devFiles.add(new URL(import.meta.url).pathname);

export default { deploy, ensureDiscussionExists };
