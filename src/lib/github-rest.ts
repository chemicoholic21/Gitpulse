import { Octokit } from"@octokit/rest";
import { getBestToken } from"./pat-pool";

export async function searchUsersByLocation(location: string, page: number = 1, perPage: number = 100) {
  const { token } = await getBestToken();
  const octokit = new Octokit({ auth: token });

  // search for users by location
  // q=location:SF or location:"San Francisco"
  const q = `location:"${location}"`;
  
  const { data } = await octokit.search.users({
    q,
    page,
    per_page: perPage,
    sort:"followers",
    order:"desc",
  });

  return {
    totalCount: data.total_count,
    users: data.items.map(user => user.login),
  };
}
