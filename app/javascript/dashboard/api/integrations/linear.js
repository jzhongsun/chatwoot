/* global axios */

import ApiClient from '../ApiClient';

class LinearAPI extends ApiClient {
  constructor() {
    super('integrations/linear', { accountScoped: true });
  }

  getTeams() {
    return axios.get(`${this.url}/teams`);
  }

  getTeamEntities(teamId) {
    return axios.get(`${this.url}/team_entities?team_id=${teamId}`);
  }

  createIssue(data) {
    return axios.post(`${this.url}/create_issue`, data);
  }

  link_issue(conversationId, issueId) {
    return axios.post(`${this.url}/link_issue`, {
      issue_id: issueId,
      conversation_id: conversationId,
    });
  }

  getLinkedIssue(conversationId) {
    return axios.get(
      `${this.url}/linked_issue?conversation_id=${conversationId}`
    );
  }

  unlinkIssue(linkId) {
    return axios.post(`${this.url}/unlink_issue`, {
      link_id: linkId,
    });
  }
}

export default new LinearAPI();
