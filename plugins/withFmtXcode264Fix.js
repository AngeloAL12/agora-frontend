const { withPodfile } = require('expo/config-plugins');

const MARKER = '# Agora: Xcode 26.4 / fmt 11.0.2 workaround';
const POST_INSTALL_ANCHOR = '  post_install do |installer|\n';

const PATCH = `    ${MARKER}
    fmt_base = File.join(installer.sandbox.root, 'fmt', 'include', 'fmt', 'base.h')
    if File.exist?(fmt_base)
      contents = File.read(fmt_base)
      patched = contents.gsub(
        '#elif defined(__apple_build_version__) && __apple_build_version__ < 14000029L',
        '#elif defined(__apple_build_version__)'
      )
      if patched != contents
        File.chmod(0644, fmt_base)
        File.write(fmt_base, patched)
      end
    end

`;

module.exports = function withFmtXcode264Fix(config) {
  return withPodfile(config, (podfileConfig) => {
    const contents = podfileConfig.modResults.contents;

    if (contents.includes(MARKER)) {
      return podfileConfig;
    }

    if (!contents.includes(POST_INSTALL_ANCHOR)) {
      throw new Error(
        'Unable to install the Xcode 26.4 fmt workaround: post_install was not found in ios/Podfile.',
      );
    }

    podfileConfig.modResults.contents = contents.replace(
      POST_INSTALL_ANCHOR,
      `${POST_INSTALL_ANCHOR}${PATCH}`,
    );

    return podfileConfig;
  });
};
