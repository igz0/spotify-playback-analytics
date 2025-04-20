export type Dictionary = {
  metadata: {
    title: string;
    description: string;
  };
  common: {
    loading: string;
    error: string;
    noData: string;
    backToTop: string;
  };
  fileUpload: {
    title: string;
    description: string;
    step1: {
      title: string;
      login: string;
      openPrivacy: string;
      requestData: string;
      receiveEmail: string;
      downloadZip: string;
    };
    step2: {
      title: string;
      privacy: string;
      uploadButton: string;
      processing: string;
      zipError: string;
    };
    footer: {
      description: string;
    };
  };
  dashboard: {
    title: string;
    filter: {
      title: string;
      startDate: string;
      endDate: string;
      limitSelect: string;
    };
    summary: {
      title: string;
      totalTracks: string;
      totalListeningTime: string;
      uniqueArtists: string;
      uniqueTracks: string;
    };
    topArtists: {
      title: string;
      rank: string;
      artist: string;
      playCount: string;
      playTime: string;
    };
    topTracks: {
      title: string;
      rank: string;
      track: string;
      artist: string;
      playCount: string;
    };
    monthlyChart: {
      title: string;
      hours: string;
      playTime: string;
    };
    hourlyChart: {
      title: string;
      hours: string;
      playTime: string;
    };
    footer: {
      dataRange: string;
      noData: string;
      totalTracks: string;
    };
    deleteData: {
      button: string;
      deleting: string;
      description: string;
      confirm: string;
      success: string;
      error: string;
    };
  };
};
